//import "./src/editor/editor";
import {parseOBJ} from "./lib/parse-obj";
import {monke} from "./monke";
import {Editor} from "./src/editor/editor";

let canvas = document.getElementById("canvas1");
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);

async function initEditor() {
    const editor = new Editor(canvas, 1, CANVAS_WIDTH, CANVAS_HEIGHT);
    await editor.init();
    editor.start();
}

initEditor().catch(console.error);

//import "./src/test/testsTemp"
//editor.addGameObject({
//        geometry: parseOBJ(monke)
//})
