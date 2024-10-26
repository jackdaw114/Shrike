import { mat4 } from "gl-matrix";
import { parseOBJ } from "./lib/parse-obj";
import { monke } from "./monke";
import { Shrike } from "./src/core/core";
import Camera from "./src/ecs/camera";
import { Transformation } from "./src/ecs/classes";
import { DebugLine, Geometry } from "./src/ecs/component-classes";
import Renderer from "./src/graphics/renderer";
import DebugSystem from "./src/graphics/debug-helper";
import PickingSystem from "./src/graphics/picker";
import {MouseEvent} from "./src/event-handler/event-handler";
import SGui from "./lib/shrike-gui/sgui";

let canvas = document.getElementById("canvas1");

const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);

const engine = new Shrike(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

const scene1 = engine.createScene();

const context = canvas.getContext("webgl2")
const renderer = engine.createSystem(
    Renderer,
    canvas.getContext("webgl2"),
    CANVAS_WIDTH / CANVAS_HEIGHT
);

const pickingSystem = engine.createSystem(PickingSystem,context,CANVAS_WIDTH,CANVAS_HEIGHT)

const debugSystem = engine.createSystem(DebugSystem,canvas.getContext("webgl2"),CANVAS_WIDTH/CANVAS_HEIGHT)

const entity1 = engine.createEntity(scene1);
const entity2 = engine.createEntity(scene1);
const debugLineEntity = engine.createEntity(scene1)


scene1.attachSystem(renderer);
scene1.attachSystem(debugSystem);
scene1.attachSystem(pickingSystem);

const { indices, vertices } = parseOBJ(monke);

scene1.addComponent(entity1, new Geometry(vertices, indices));
scene1.addComponent(entity1, new Transformation());
scene1.addComponent(entity2, new Geometry(vertices, indices));
scene1.addComponent(entity2, new Transformation())
scene1.addComponent(debugLineEntity, new DebugLine())






// ********************* Test Stuff ******************

const transformation = entity2.getComponent('Transformation')

mat4.rotate(transformation.getMatrix(), transformation.getMatrix(), 1.4, [0,1,0])
mat4.translate(transformation.getMatrix(), transformation.getMatrix(), [0,0,2])
console.log(transformation)

const camera = scene1.getCamera();
mat4.translate(
    scene1.getCamera(),
    scene1.getCamera(),
    [0, 0, -10]
);

let lineObj = debugLineEntity.getComponent("DebugLine") 
function drawGrid(lineComponent, numberOfLines,spacing) {
    let size = (numberOfLines * spacing - spacing) / 2
    for (let i = 0; i < numberOfLines; i++) {
        lineComponent.addLine([-size,0,spacing*i-size,0,0,0],[size,0,spacing*i-size,0,0,0])
    }
    for (let i = 0; i < numberOfLines; i++) {
        lineComponent.addLine([spacing*i-size,0,-size,0,0,0],[spacing*i-size,0,size,0,0,0])
    }
}

drawGrid(lineObj, 15, 0.5)

canvas.addEventListener('click', (e)=>{
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left;
    const y = rect.height - (e.clientY - rect.top); // flip Y
    console.log(x,y)
    console.log(pickingSystem.readColor(x, y))
    
})

const mouseEvents = new MouseEvent(canvas)
// camera class stuff to do (initalizaton)
const tempCamera = scene1.activeCamera
mouseEvents.addEventListener('drag', (e) => {
    const rate = 200;
    tempCamera.panHorizontal(e.dispX/rate)
    console.log(e.dispY)
    tempCamera.panVertical(e.dispY/rate)
})
mouseEvents.addEventListener('scroll', (e)=>{
    const rate = 200;
    tempCamera.zoom(e.wheelDeltaY/rate)
})

customElements.define("s-gui", SGui)
const sguiInstance = new SGui();

const handle = sguiInstance.createWindow("test", true)
let controller = {
    r: 0,
    g: 0,
    b: 0
}
handle.appendColorPicker(controller)



// ********************* END *************************

engine.init();
engine.start();
