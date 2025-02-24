import SGuiButton from "../../../lib/shrike-gui/child-elements/button";
import {SGui} from "../../../lib/shrike-gui/sgui";

/**
 *
 * @param {HTMLElement} element 
 * @param {SGui} sgui 
 * @returns 
 */
export const createMenuBar = (editor,element,sgui) => {
    const menuBar = {};
    menuBar.mainWindow = sgui.createWindow("Menu Bar")
    menuBar.buttons = {
        transformationWidgetToggle: new SGuiButton(element,{})
    };
    menuBar.mainWindow.append(...Object.values(menuBar.buttons))
    element.addEventListener("sgui-button-click", (e)=>{
        console.log(e.detail.button) 
        console.log(menuBar.buttons.transformationWidgetToggle)
        switch (e.detail.button) {
            case menuBar.buttons.transformationWidgetToggle:
                if (editor.editorOverlays.editorGizmoRenderer.active) {
                    editor.engine.compositor.removeFramebuffer(editor.editorGizmoRenderer.framebuffer)
                    editor.editorOverlays.editorGizmoRenderer.active = false;
                }
                else {
                    editor.engine.compositor.addFramebuffer(editor.editorGizmoRenderer.framebuffer,{priority:0})
                    editor.editorOverlays.editorGizmoRenderer.active = true;
                }
                break;
            default:
                console.log("not a valid  button")
        }
    })
    

    return menuBar;
}

