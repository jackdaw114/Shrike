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
    menuBar.mainWindow = sgui.createWindow("Menu Bar",true)
    menuBar.buttons = {
        transformationWidgetToggle: new SGuiButton(element,{
            icon: "M3,3H21V21H3V3M5,5V19H19V5H5M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z",
            iconSize: 20,
            customClasses: ["menu-bar-button"]
        }),
        toggleRunGame: new SGuiButton(element,{
            icon: "M8,5.14V19.14L19,12.14L8,5.14Z",
            iconSize: 20,
            customClasses: ["menu-bar-button"]
        })
    };
    menuBar.mainWindow.append(...Object.values(menuBar.buttons))
    element.addEventListener("sgui-button-click", (e)=>{
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
            case menuBar.buttons.toggleRunGame:
                editor.toggleRunGame()
                break;
            default:
                console.log("not a valid  button")
        }
    })
    

    return menuBar;
}

