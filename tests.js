import { mat4 } from "gl-matrix";
import { parseOBJ } from "./lib/parse-obj";
import { monke } from "./monke";
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

const handle = sguiInstance.createWindow("test", true)
let controller = {
    r: 0,
    g: 0,
    b: 0
}
handle.appendColorPicker(controller)

let panelHandler = sguiInstance.createWindow("panel", true)
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

panelHandler.appendFilePanel(filePanelController);



// ********************* END *************************


