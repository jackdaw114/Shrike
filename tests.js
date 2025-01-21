
// import { Shrike } from "./src/core/core";
// import Camera from "./src/ecs/camera";
// import { Transformation } from "./src/ecs/classes";
// import { DebugLine, Geometry } from "./src/ecs/component-classes";
// import Renderer from "./src/graphics/renderer";
// import DebugSystem from "./src/gpu/debug-helper";
// import PickingSystem from "./src/gpu/picker";
// import {MouseEvent} from "./src/event-handler/event-handler";
import SGui from "./lib/shrike-gui/sgui";
// import PickingSystem from './src/graphics/picker';
// import { PickingSystem } from './src/gpu/picker/picker';
// import { DebugSystem } from './src/gpu/debug-graphics/debug-helper';
// import { Renderer } from './src/gpu/renderer/renderer';


import "./src/editor/editor.js"

customElements.define("s-gui", SGui)
const sguiInstance = new SGui();




let panelHandler = sguiInstance.createWindow("panel1", true)
let panelHandler2 = sguiInstance.createWindow("panel2", true)
let sliderHandler2 = sguiInstance.createWindow("slider", true)
let filePanelController = {
    _files: [],
    _currentContext: null,

    get files() {
        return this._files;
    },

    
    get currentContext() {
        return this._currentContext;
    },

    set currentContext(newContext) {
        this._currentContext = newContext;
    }
}


const sliderController = {
        value: 75,
    };

panelHandler.appendFilePanel(filePanelController);
panelHandler2.appendFilePanel(filePanelController);
sliderHandler2.appendSlider(sliderController)


// sguiInstance.destroy();


// ********************* END *************************


