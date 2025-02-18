//import "./src/editor/editor";
import {parseOBJ} from "./lib/parse-obj";
import {monke} from "./monke";
import {Editor} from "./src/editor/editor";

let canvas = document.getElementById("canvas1");
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);
const editor = new Editor(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT)


editor.start()
//import "./src/test/testsTemp"
//editor.addGameObject({
//        geometry: parseOBJ(monke)
//})
