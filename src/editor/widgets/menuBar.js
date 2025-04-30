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
            text: "Transform",
            icon: `<svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" baseProfile="full"  fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0.2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 38,38L 51.416,38C 52.1876,36.2341 53.9497,35 56,35C 58.7614,35 61,37.2386 61,40C 61,42.7614 58.7614,45 56,45C 53.9497,45 52.1876,43.7659 51.416,42L 36.8284,42L 25.8284,53L 34,53L 30,57L 19,57L 19,46L 23,42L 23,50.1716L 34,39.1716L 34,24.584C 32.2341,23.8124 31,22.0503 31,20C 31,17.2386 33.2386,15 36,15C 38.7614,15 41,17.2386 41,20C 41,22.0503 39.7659,23.8124 38,24.584L 38,38 Z "></path> </g></svg>`,
            iconPosition: "left"
        }),
        toggleRunGame: new SGuiButton(element,{
            icon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M5 3l14 9-14 9V3z"/>
            </svg>`,
            iconPosition: "left"
        }),
        toggleCannonRenderer: new SGuiButton(element,{
            text: "Physics Debug",
            icon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            iconPosition: "left"
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

                const playIcon = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M5 3l14 9-14 9V3z"/>
                </svg>`;
                const pauseIcon = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>`;
                const iconContainer = menuBar.buttons.toggleRunGame.querySelector('.sgui-button-icon');
                console.log(iconContainer)
                if (iconContainer) {
                    console.log("is running?",editor.isGameRunning)
                    iconContainer.innerHTML = editor.isGameRunning ? pauseIcon : playIcon;
                }
                break;
            case menuBar.buttons.toggleCannonRenderer:
                console.log("toggle cannon renderer")
                console.log("cannon is running?",editor.cannonRenderer.isRunning)
                if (editor.cannonRenderer.isRunning) {
                    editor.cannonRenderer.stop();
                } else {
                    editor.cannonRenderer.start();
                }
                break;
            default:
                console.log("not a valid button")
        }
    })
    

    return menuBar;
}

