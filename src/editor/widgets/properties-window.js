import { parseOBJ } from "../../../lib/parse-obj";
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiFilePanel from "../../../lib/shrike-gui/child-elements/file-panel";
import { Geometry } from "../../ecs/component-classes";
import { Material } from "../../material/material";
import { Script } from "../../ecs/component-classes";
import SGuiText from "../../../lib/shrike-gui/child-elements/text";
import { findFunctionBody } from "../../../lib/util/function-body-parser";

export const createPropertiesWindow = (sgui, object,scene,renderer) => {
    const propertiesWindow = {};
    let activeObj = {};
    propertiesWindow.mainWindow = sgui.createWindow("properties", true)
    
    // Data structure to store entity objects for all entities
    propertiesWindow.entityObjects = new Map(); // Map<entityId, {Geometry: null, Script: null, files: {Script: File, Geometry: File}}>
    propertiesWindow.PhysicsBody = new SGuiText({text:"TODO: Physics settings"}) 
    propertiesWindow.object = object;
    propertiesWindow.components = [];
    document.addEventListener("set-active-object", (e) => {
        console.log("set active object",e.detail.entity.getComponent("PhysicsBody"))
        if(activeObj === e.detail.entity) return;
        activeObj = e.detail.entity;
        propertiesWindow.components = e.detail.entity.components;
        console.log("propertiesWindow.components  ",propertiesWindow.components)
        propertiesWindow.mainWindow.removeAllChildren()
        for (const key of Object.keys(propertiesWindow.components)) {
            console.log("key: ", key)
            if (["mainWindow","object","Transformation"].includes(key)) continue;
            propertiesWindow.mainWindow.appendChild(propertiesWindow[key])
        }

        // Update file panels based on active entity's data
        
            const entityData = propertiesWindow.entityObjects.get(activeObj.id);
            
            // Send files to file panels
            propertiesWindow.Script.filePanel.dispatchEvent(new CustomEvent("update-files", {
                detail: { files: entityData?.files?.Script ? [entityData.files.Script] : [] }
            }));
            
            propertiesWindow.Geometry.filePanel.dispatchEvent(new CustomEvent("update-files", {
                detail: { files: entityData?.files?.Geometry ? [entityData.files.Geometry] : [] }
            }));
        
    })

    document.addEventListener("refresh-properties", (e) => {
        if (activeObj === e.detail.entity) {
            propertiesWindow.components = e.detail.entity.components;
            propertiesWindow.mainWindow.removeAllChildren()
            for (const key of Object.keys(propertiesWindow.components)) {
                if (["mainWindow","object","Transformation"].includes(key)) continue;
                propertiesWindow.mainWindow.appendChild(propertiesWindow[key])
            }
        }
    })

    propertiesWindow.Geometry = new SGuiDropDown({heading:"Geometry"})
    propertiesWindow.Script = new SGuiDropDown({heading:"Script"})
    propertiesWindow.Script.filePanel = new SGuiFilePanel(propertiesWindow.Script,{type:"special"})
    propertiesWindow.Script.contentDiv.appendChild(propertiesWindow.Script.filePanel);
    propertiesWindow.Geometry.filePanel = new SGuiFilePanel(propertiesWindow.Geometry,{type:"special"})
    propertiesWindow.Geometry.contentDiv.appendChild(propertiesWindow.Geometry.filePanel);

    // Add file removal event listeners
    propertiesWindow.Script.filePanel.addEventListener("file-removed", (e) => {
        if (activeObj && propertiesWindow.entityObjects.has(activeObj.id)) {
            const entityData = propertiesWindow.entityObjects.get(activeObj.id);
            if (entityData.Script) {
                scene.removeComponent(activeObj, entityData.Script);
                entityData.Script = null;
                if (entityData.files) {
                    entityData.files.Script = null;
                }
                propertiesWindow.entityObjects.set(activeObj.id, entityData);
            }
        }
    });

    propertiesWindow.Geometry.filePanel.addEventListener("file-removed", (e) => {
        if (activeObj && propertiesWindow.entityObjects.has(activeObj.id)) {
            const entityData = propertiesWindow.entityObjects.get(activeObj.id);
            if (entityData.Geometry) {
                scene.removeComponent(activeObj, entityData.Geometry);
                entityData.Geometry = null;
                if (entityData.files) {
                    entityData.files.Geometry = null;
                }
                propertiesWindow.entityObjects.set(activeObj.id, entityData);
            }
        }
    });

    propertiesWindow.Script.filePanel.addEventListener("special-file-drop", async (e) => {
        console.log("file-selected", e.detail.file)
        try {
            const file = e.detail.file;
            const scriptContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
            
            console.log("scriptContent", scriptContent)
            
            // Stack-based parser for nested braces
            const updateFunctionBody = findFunctionBody(scriptContent, 'update');
            const initFunctionBody = findFunctionBody(scriptContent, 'init')
            const script = new Script({
                    update: updateFunctionBody ? new Function('deltaTime','CANNON', 'components', 'scene', 'activeKeys', updateFunctionBody) : ()=>{},
                    init: initFunctionBody ? new Function('CANNON','components','scene',initFunctionBody):()=>{}
            });
            
            console.log("updateFunctionBody", updateFunctionBody);
            
            // Initialize entity data if it doesn't exist
            if (!propertiesWindow.entityObjects.has(activeObj.id)) {
                propertiesWindow.entityObjects.set(activeObj.id, {
                    Geometry: null,
                    Script: null,
                    files: {
                        Script: null,
                        Geometry: null
                    }
                });
            }
            
            const entityData = propertiesWindow.entityObjects.get(activeObj.id);
            entityData.Script = script;
            entityData.files.Script = file;
            propertiesWindow.entityObjects.set(activeObj.id, entityData);
            
            scene.addComponent(activeObj, script);
        } catch (error) {
            console.error("Error loading script:", error);
        }
    })
    propertiesWindow.Geometry.filePanel.addEventListener("special-file-drop", async (e) => {
        console.log("file-drop", e.detail.file)
        const {indices,vertices} = await parseOBJ(e.detail.file)
        const geometry = new Geometry(vertices,indices,new Material([1., 0., 0.], [1., 0., 0.], [1., 0., 0.], 1))
        
        // Initialize entity data if it doesn't exist
        if (!propertiesWindow.entityObjects.has(activeObj.id)) {
            propertiesWindow.entityObjects.set(activeObj.id, {
                Geometry: null,
                Script: null,
                files: {
                    Script: null,
                    Geometry: null
                }
            });
        }
        
        const entityData = propertiesWindow.entityObjects.get(activeObj.id);
        entityData.Geometry = geometry;
        entityData.files.Geometry = e.detail.file;
        propertiesWindow.entityObjects.set(activeObj.id, entityData);
        
        scene.addComponent(activeObj,geometry)
        
        renderer.initGeometry(geometry)
        console.log(activeObj.getComponent("Geometry"))
    })

    document.addEventListener("reload-scene",()=>{
        for (const entity of Object.values(scene.entities)){
            propertiesWindow.entityObjects.set(entity.id, {
                Geometry: entity.getComponent("Geometry"),
                Script: entity.getComponent("Script"),
                files: {
                    Script:{
                        name:"loaded script", 
                        path:"loaded script"
                    },
                    Geometry:{
                        name:"loaded geometry", 
                        path:"loaded geometry"
                    }
                }
            })
        }
    })

    return propertiesWindow;
}