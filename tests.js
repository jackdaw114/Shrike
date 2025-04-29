//import "./src/editor/editor";
import { parseOBJ } from "./lib/parse-obj";
import { safeStringify } from "./lib/util/safe-stringify";
import { monke } from "./monke";
import { Geometry } from "./src/ecs/component-classes";
import { Editor } from "./src/editor/editor";
import { box } from "./assets/box";
import CANNON from "cannon";

document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("canvas1");

    // Set the display size of the canvas
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    // Set the actual size in memory (scaled to account for extra pixel density)
    const scale = 1;
    const CANVAS_WIDTH = (canvas.width = window.innerWidth * scale);
    const CANVAS_HEIGHT = (canvas.height = window.innerHeight * scale);

    // Calculate the aspect ratio
    const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    let editor;
    async function initEditor() {
        editor = new Editor(canvas, 1 / 60, CANVAS_WIDTH, CANVAS_HEIGHT);
        await editor.init();
        editor.start();
    }

    initEditor().catch(console.error);


    const endScreen = document.createElement('div');
    endScreen.id = 'endScreen';

    // Ensure it's always on top of everything
    endScreen.style.position = "fixed";
    endScreen.style.top = "0";
    endScreen.style.left = "0";
    endScreen.style.width = "100vw";
    endScreen.style.height = "100vh";
    endScreen.style.background = "rgba(0, 0, 0, 0.8)";
    endScreen.style.zIndex = "9999";
    endScreen.style.display = "flex";
    endScreen.style.flexDirection = "column";
    endScreen.style.justifyContent = "center";
    endScreen.style.alignItems = "center";
    endScreen.style.color = "white";
    endScreen.style.fontFamily = "Arial, sans-serif";

    const heading = document.createElement('h1');
    heading.textContent = 'Game Over';


    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart';
    restartBtn.style.padding = "10px 20px";
    restartBtn.style.fontSize = "16px";
    restartBtn.style.marginTop = "20px";
    restartBtn.onclick = () => {
        document.body.removeChild(endScreen)
    };

    document.addEventListener("game-end", e => {
        endScreen.appendChild(heading);
        endScreen.appendChild(restartBtn);
        document.body.appendChild(endScreen);

    });

    
    const floatingContainer = document.createElement('div');

// Style it to "float"
floatingContainer.style.position = 'fixed';
floatingContainer.style.top = '20px';
floatingContainer.style.right = '280px';
floatingContainer.style.width = 'auto';
floatingContainer.style.height = 'auto';
floatingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
floatingContainer.style.color = 'white';
floatingContainer.style.padding = '10px';
floatingContainer.style.borderRadius = '8px';
floatingContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
floatingContainer.style.zIndex = 99999;


// Attach to the document
document.body.appendChild(floatingContainer);
    setInterval(()=>{
        floatingContainer.textContent = "FPS: "+ editor.engine.framerate.toFixed(0)
    },100)
})

//import "./src/test/testsTemp"
//editor.addGameObject({
//        geometry: parseOBJ(monke)
//})