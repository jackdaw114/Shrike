import { parseOBJ } from "../../../lib/parse-obj";
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiFilePanel from "../../../lib/shrike-gui/child-elements/file-panel";
import { Geometry } from "../../ecs/component-classes";
import { Material } from "../../material/material";
import { Script } from "../../ecs/component-classes";

export const createPropertiesWindow = (sgui, object,scene,renderer) => {
    const propertiesWindow = {};
    let activeObj = {};
    propertiesWindow.mainWindow = sgui.createWindow("properties", true)
    
    propertiesWindow.object = object;
    propertiesWindow.components = [];
    document.addEventListener("set-active-object", (e) => {
        // if (activeObj === e.detail.entity) {
        //     return;
        // }
        
        activeObj = e.detail.entity;
        propertiesWindow.components = e.detail.entity.components;
        console.log("propertiesWindow.components  ",propertiesWindow.components)
        propertiesWindow.mainWindow.removeAllChildren()
        for (const key of Object.keys(propertiesWindow.components)) {
            console.log("key: ", key)
            if (["mainWindow","object","Transformation"].includes(key)) continue;
            propertiesWindow.mainWindow.appendChild(propertiesWindow[key])
            
        }

    })
    propertiesWindow.Geometry = new SGuiDropDown({heading:"Geometry"})
    propertiesWindow.Script = new SGuiDropDown({heading:"Script"})
    propertiesWindow.Script.filePanel = new SGuiFilePanel(propertiesWindow.Script,{type:"special"})
    propertiesWindow.Script.contentDiv.appendChild(propertiesWindow.Script.filePanel);
    propertiesWindow.Geometry.filePanel = new SGuiFilePanel(propertiesWindow.Geometry,{type:"special"})
    propertiesWindow.Geometry.contentDiv.appendChild(propertiesWindow.Geometry.filePanel);

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
            const findFunctionBody = (content, functionName) => {
                let stack = [];
                let startIndex = -1;
                let inFunction = false;
                
                // Find the start of the function
                const functionStartRegex = new RegExp(`(?:function\\s+${functionName}|${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>)\\s*{`);
                const match = content.match(functionStartRegex);
                if (!match) return null;
                console.log("match", match)
                startIndex = match.index + match[0].length;
                console.log("match index", startIndex)
                console.log("match[whatever]", match[startIndex])
                
                stack.push('{') 
                // Parse through the content
                for (let i = startIndex; i < content.length; i++) {
                    const char = content[i];
                    
                    if (char === '{') {
                        stack.push('{');
                    } else if (char === '}') {
                        stack.pop();
                        if (stack.length === 0) {
                            return content.substring(startIndex, i);
                        }
                    }
                }
                return null;
            };
            
            const updateFunctionBody = findFunctionBody(scriptContent, 'update');
            if (!updateFunctionBody) {
                console.error("No valid update function found in script file");
                return;
            }
            
            console.log("updateFunctionBody", updateFunctionBody);
            const script = new Script({
                update: new Function('deltaTime', 'components', 'scene', 'activeKeys', updateFunctionBody)
            });
            scene.addComponent(activeObj, script);
        } catch (error) {
            console.error("Error loading script:", error);
        }
    })
    propertiesWindow.Geometry.filePanel.addEventListener("special-file-drop", async (e) => {
        console.log("file-drop", e.detail.file)
        const {indices,vertices} = await parseOBJ(e.detail.file)
        const geometry = new Geometry(vertices,indices,new Material([1., 0., 0.], [1., 0., 0.], [1., 0., 0.], 1))
        scene.addComponent(activeObj,geometry)
        
        renderer.initGeometry(geometry)
        console.log(activeObj.getComponent("Geometry"))
    })
    return propertiesWindow;
}