
// import { Shrike } from "./src/core/core";
// import Camera from "./src/ecs/camera";
// import { Transformation } from "./src/ecs/classes";
// import { DebugLine, Geometry } from "./src/ecs/component-classes";
// import Renderer from "./src/graphics/renderer";
// import DebugSystem from "./src/gpu/debug-helper";
// import PickingSystem from "./src/gpu/picker";
// import {MouseEvent} from "./src/event-handler/event-handler";
import SGui, { SGuiSlider } from "./lib/shrike-gui/sgui";
// import PickingSystem from './src/graphics/picker';
// import { PickingSystem } from './src/gpu/picker/picker';
// import { DebugSystem } from './src/gpu/debug-graphics/debug-helper';
// import { Renderer } from './src/gpu/renderer/renderer';


import "./src/editor/editor.js"

customElements.define("s-gui", SGui)
const sguiInstance = new SGui();




let panelHandler = sguiInstance.createWindow("panel1", true)
let panelHandler2 = sguiInstance.createWindow("panel2", true)
let sliderWindow = sguiInstance.createWindow("slider", true)
let slider = new SGuiSlider(sliderWindow);

let filePanelController = {
    files: [],
    currentContext: null,
}

let filePanelController2 = {
    files: [],
    currentContext: null,
}


panelHandler.appendFilePanel(filePanelController);
panelHandler2.appendFilePanel(filePanelController2);
sliderWindow.appendChild(slider)


// sguiInstance.destroy();


// ********************* END *************************


