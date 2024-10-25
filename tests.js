import {Shrike} from "./src/core/core"
import { Scene } from "./src/ecs/classes"
import Renderer from "./src/graphics/renderer"
import { ball } from "./ball"
import { Geometry } from "./src/ecs/component-classes"
import {parseOBJ} from "./lib/parse-obj"
import Camera from "./src/ecs/camera"
let canvas = document.getElementById("canvas1")
let context = canvas.getContext("webgl2")
const engineInstance = new Shrike(canvas, 1000, 600)
const scene12 = new Scene()
engineInstance.addScene(scene12, "hello")
const render = new Renderer(scene12, context, 1000/600)
const entity = scene12.createEntity()
scene12.addSystem(render, ["Geometry"])
const {indices, vertices} = parseOBJ(ball)
console.log(indices, vertices)
scene12.addComponent(entity, new Geometry(vertices, indices))
scene12.setCamera(new Camera())








engineInstance.start()
