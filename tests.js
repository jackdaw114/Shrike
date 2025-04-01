//import "./src/editor/editor";
import {parseOBJ} from "./lib/parse-obj";
import {monke} from "./monke";
import {Editor} from "./src/editor/editor";

let canvas = document.getElementById("canvas1");

// Set the display size of the canvas
canvas.style.width = `${screen.width}px`;
canvas.style.height = `${screen.height}px`;

// Set the actual size in memory (scaled to account for extra pixel density)
const scale = 1;
const CANVAS_WIDTH = (canvas.width = screen.width * scale);
const CANVAS_HEIGHT = (canvas.height = screen.height * scale);

// Calculate the aspect ratio
const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

async function initEditor() {
    const editor = new Editor(canvas, scale, CANVAS_WIDTH, CANVAS_HEIGHT);
    await editor.init();
    editor.start();
}

initEditor().catch(console.error);

//import "./src/test/testsTemp"
//editor.addGameObject({
//        geometry: parseOBJ(monke)
//})
