import SGuiContainer from "../../../lib/shrike-gui/child-elements/container"
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down"
import SGuiInputBox from "../../../lib/shrike-gui/child-elements/input-box"
import { Script } from "../../ecs/component-classes"

const STEP_SIZE = 0.05
export const createTransformationWindow = (editor,sgui,element)=>{
    const transformationWindow= {}
    transformationWindow.mainWindow = sgui.createWindow("Transformation Window",true)
    
    // Add CSS styles for grid layout
    const style = document.createElement('style');
    style.textContent = `
        .transformation-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 8px;
        }
        .transformation-input {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .transformation-label {
            font-size: 0.8em;
            color: #888;
            text-align: center;
        }
    `;
    transformationWindow.mainWindow.appendChild(style);

    // Create dropdowns
    transformationWindow.moveDropDown = new SGuiDropDown({
        heading:"Translation"
    })
    transformationWindow.scaleDropDown = new SGuiDropDown({
        heading:"Scale"
    })
    transformationWindow.rotationDropDown = new SGuiDropDown({
        heading:"Rotation"
    })

    // Create input boxes with grid layout
    const createInputGrid = (heading, values) => {
        const container = document.createElement('div');
        container.className = 'transformation-grid';
        
        Object.entries(values).forEach(([key, value]) => {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'transformation-input';
            
            const label = document.createElement('div');
            label.className = 'transformation-label';
            label.textContent = key.toUpperCase();
            
            inputContainer.appendChild(label);
            inputContainer.appendChild(value);
            container.appendChild(inputContainer);
        });
        
        return container;
    };

    // Initialize input boxes
    transformationWindow.translation = {
        x:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:1}),
        y:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:1}),
        z:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:1})
    }
    transformationWindow.scale = {
        x:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:0}),
        y:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:0}),
        z:new SGuiInputBox({heading:"",type:"number",step:STEP_SIZE,content:0})
    }
    transformationWindow.rotation = {
        x:new SGuiInputBox({heading:"",type:"number",step:1,content:0}),
        y:new SGuiInputBox({heading:"",type:"number",step:1,content:0}),
        z:new SGuiInputBox({heading:"",type:"number",step:1,content:0})
    }

    // Add input grids to dropdowns
    transformationWindow.moveDropDown.appendChild(createInputGrid("Translation", transformationWindow.translation));
    transformationWindow.scaleDropDown.appendChild(createInputGrid("Scale", transformationWindow.scale));
    transformationWindow.rotationDropDown.appendChild(createInputGrid("Rotation", transformationWindow.rotation));

    // Setup proxies for each input box
    Object.entries(transformationWindow.translation).forEach(([key,value])=>{
        value.state = new Proxy({},{
            set(target,prop,val){
                target[prop] = val
                value.inputBox.value = val
                if(editor.activeObjects.length >0){
                    editor.activeObjects[0].getComponent("Transformation").position[key] = val
                    editor.activeObjects[0].getComponent("Transformation").updateMatrix()
                }
                return true
            }
        })
    })

    Object.entries(transformationWindow.scale).forEach(([key,value])=>{
        value.state = new Proxy({},{
            set(target,prop,val){
                value.inputBox.value = val
                target[prop] = val
                if(editor.activeObjects.length >0){
                    editor.activeObjects[0].getComponent("Transformation").scale[key]= val
                    editor.activeObjects[0].getComponent("Transformation").updateMatrix()
                }
                return true
            }
        })
    })

    Object.entries(transformationWindow.rotation).forEach(([key,value])=>{
        value.state = new Proxy({},{
            set(target,prop,val){
                target[prop] = val
                value.inputBox.value = val
                if(editor.activeObjects.length >0){
                    editor.activeObjects[0].getComponent("Transformation").rotation[key] = val
                    editor.activeObjects[0].getComponent("Transformation").updateRotation()
                    editor.activeObjects[0].getComponent("Transformation").updateMatrix()
                }
                return true
            }
        })
    })

    // Add update script
    const script_entity = editor.engine.createEntity(editor.editorScene)
    editor.editorScene.addComponent(script_entity, new Script({ 
        update: (deltaTime, components, scene) => {
            if (editor.activeObjects[0] && editor.activeObjects[0].getComponent("Transformation")){
                const position = editor.activeObjects[0].getComponent("Transformation").position
                const scale = editor.activeObjects[0].getComponent("Transformation").scale
                const rot = editor.activeObjects[0].getComponent("Transformation").rotation
                Object.entries(position).forEach(([key,value])=>{
                    transformationWindow.translation[key].setValue(value)
                })
                Object.entries(scale).forEach(([key,value])=>{
                    transformationWindow.scale[key].setValue(value)
                })
                Object.entries(rot).forEach(([key,value])=>{
                    transformationWindow.rotation[key].setValue(value)
                })
            }
        }
    }))

    // Append dropdowns to main window
    transformationWindow.mainWindow.append(
        transformationWindow.moveDropDown,
        transformationWindow.scaleDropDown,
        transformationWindow.rotationDropDown
    )
}