import SGuiContainer from "../../../lib/shrike-gui/child-elements/container"
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down"
import SGuiInputBox from "../../../lib/shrike-gui/child-elements/input-box"
import { Script } from "../../ecs/component-classes"

const STEP_SIZE = 0.05
export const createTransformationWindow = (editor,sgui,element)=>{
    const transformationWindow= {}
    transformationWindow.mainWindow = sgui.createWindow("transformation",true)
    transformationWindow.moveDropDown = new SGuiDropDown({
        heading:"translation"
    })
    transformationWindow.scaleDropDown = new SGuiDropDown({
        heading:"scale"
    })
    transformationWindow.rotationDropDown = new SGuiDropDown({
        heading:"rotation"
    })
    transformationWindow.translation = {
        x:new SGuiInputBox({heading:"x:",type:"number",step:STEP_SIZE,content:1}),
        y:new SGuiInputBox({heading:"y",type:"number",step:STEP_SIZE,content:1}),
        z:new SGuiInputBox({heading:"z",type:"number",step:STEP_SIZE,content:1})
    }
    transformationWindow.scale = {
        x:new SGuiInputBox({heading:"x:",type:"number",step:STEP_SIZE,content:0}),
        y:new SGuiInputBox({heading:"y",type:"number",step:STEP_SIZE,content:0}),
        z:new SGuiInputBox({heading:"z",type:"number",step:STEP_SIZE,content:0})
    }
    transformationWindow.rotation = {
        x:new SGuiInputBox({heading:"x:",type:"number",step:1,content:0}),
        y:new SGuiInputBox({heading:"y",type:"number",step:1,content:0}),
        z:new SGuiInputBox({heading:"z",type:"number",step:1,content:0})
    }

    Object.entries(transformationWindow.translation).forEach(([key,value])=>{
        transformationWindow.moveDropDown.appendChild(value)
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
        transformationWindow.scaleDropDown.appendChild(value)
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
        transformationWindow.rotationDropDown.appendChild(value)
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
    const script_entity = editor.engine.createEntity(editor.editorScene)

    editor.editorScene.addComponent(script_entity, new Script({ update: (deltaTime, components, scene)=>{
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
    }}))
    transformationWindow.mainWindow.append(transformationWindow.moveDropDown,transformationWindow.scaleDropDown,transformationWindow.rotationDropDown)
}