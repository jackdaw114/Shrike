import SGuiButton from "../../../lib/shrike-gui/child-elements/button";
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiList from "../../../lib/shrike-gui/child-elements/list";
import SGuiText from "../../../lib/shrike-gui/child-elements/text";
import { Shrike } from "../../core/core";
import {Transformation} from "../../ecs/classes";
import {Geometry, Script} from "../../ecs/component-classes";

/**
 *
 * @param {*} element
 * @param {Shrike} engine
 * @param {*} sgui
 * @returns
 */
export const createSceneGraphWindow = (element, engine, sgui,scene) => {
    const sceneGraphWindow = {};
    const sceneGraph = {};
    sceneGraphWindow.mainWindow = sgui.createWindow("Scene", true);
    sceneGraphWindow.ribbon = document.createElement("div");
    sceneGraphWindow.entities = []
    sceneGraphWindow.ribbon.addObjectButton = new SGuiButton(
        sceneGraphWindow.mainWindow
    );
    sceneGraphWindow.ribbon.appendChild(
        sceneGraphWindow.ribbon.addObjectButton
    );
    sceneGraphWindow.listRoot = new SGuiList();
    
    for (const key of Object.keys(sceneGraphWindow)) {
        if (key == "mainWindow" || key == "entities") continue;
        sceneGraphWindow.mainWindow.appendChild(sceneGraphWindow[key]);
    }
    const selectionWindow = createSelectionWindow(sgui)
    const addObject = () => {
        selectionWindow.open() // some sort of context optinos ig here 
        selectionWindow.context = sceneGraphWindow.mainWindow
    };

    sceneGraphWindow.ribbon.addObjectButton.onclick = (e) => {
        addObject()
    };

    sceneGraphWindow.mainWindow.addEventListener("selected", e => {
        console.log(e.detail)
        switch (e.detail.name) {
            case "node":
                const entity = engine.createEntity(scene)
                console.log(entity)
                sceneGraphWindow.entities.push({
                    entity: entity,
                    name:e.detail.name
                })
                updateSceneGraphWindow(sceneGraphWindow,selectionWindow,scene)
            
        }
    })

    return {
        window: sceneGraphWindow,
        sceneGraph: sceneGraph,
        addObject: addObject,
    };
};

function createSelectionWindow(sgui) {
    const selectionWindow = sgui.createWindow("select object to add", false);
    selectionWindow.context = null
    const tempList = [
        {
            name: "node",
            func: () => {
                
            }
        },
        {
            name: "geometry",
            func: () => {

            }
        },
        {
            name: "script",
            func: () => {

            }
        },
        {
            name: "collider",
            func: () => {

            }
        },
    ];
    const list = new SGuiList() 
    tempList.forEach(item=>{
        const button = document.createElement("button")
        button.innerHTML = item.name

        button.onclick = (e) => {
            item.func() 
            selectionWindow.context?.dispatchEvent(new CustomEvent("selected",{
                detail:{
                    ...item
                }
            }))
            selectionWindow.close()
        }
        list.appendChild(button)
    })
    selectionWindow.appendChild(list)
    return selectionWindow
}

function updateSceneGraphWindow(sceneGraphWindow,selectionWindow,scene) {
    sceneGraphWindow.listRoot.innerHTML = ""  // TODO: check if events are being discarded here
    for (const entity of sceneGraphWindow.entities) {
        const dropDown = new SGuiDropDown({heading:entity.entity.name}) 
        sceneGraphWindow.listRoot.appendChild(dropDown)
        dropDown.contentDiv.innerHTML = ""
        dropDown.entity = entity.entity
        let update = () => {
            dropDown.contentDiv.innerHTML = ""
            for (const component in entity.entity.components){
            const entry = new SGuiText({text:component})
            entry.className = component
            dropDown.appendChild(entry)
            entry.ondblclick = (e) => {
                document.dispatchEvent(new CustomEvent("set-active-object",{
                    detail: {
                        entity:dropDown.entity
                    }
                }))
            }
        }}
        update()
        dropDown.toggleDiv.ondblclick = () => {
            selectionWindow.open()
            selectionWindow.context = dropDown 
        }
        console.log(entity.entity.components)
        dropDown.addEventListener("selected", e => {
            switch (e.detail.name) {
                case "geometry": //edge case issues
                    if (dropDown.geometry) break;
                    const geometry = new Geometry(
                        [],[]
                    )
                    const transformation = new Transformation()
                    dropDown.geometry = geometry 
                    scene.addComponent(entity.entity,geometry)
                    scene.addComponent(entity.entity,transformation)
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
                case "collider":
                    if (dropDown.collider) break;
                    const collider = new Collider(
                        [],[]
                    )
                    dropDown.collider = collider 
                    scene.addComponent(entity.entity,collider)  
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
                case "script":
                    if (dropDown.script) break;
                    const script = new Script(
                        [],[]
                    )
                    dropDown.script = script 
                    scene.addComponent(entity.entity,script)  
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
            } 
        })
    }
}
