import { Scene } from "../ecs/classes";
import Renderer from "../graphics/renderer";

export class Shrike {
    lastFrameTime = 0;
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas, width, height) {
        this.CANVAS_WIDTH = canvas.width = width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.renderer = new Renderer("test",
            canvas.getContext("webgl2"),
            this.CANVAS_WIDTH / this.CANVAS_HEIGHT
        ); // this bad
        /**
         * @type {Object}
         */
        this.scenes = {};
        /**
         * @tyep {String}
         */
        this.activeScene;
        this.gameLoop = this.gameLoop.bind(this);
    }
    // generrate data from json file?

    /**
     * @param {Scene} scene
     */
    addScene(scene, name) {
        if (!this.scenes.hasOwnProperty(name)) {
            scene.init(); //check if init in required
            this.scenes[name] = scene;
            if (this.activeScene == null) {
                this.activeScene = scene;
            }
        }
    }

    testFunciton(func) {
        this.testFunc = func;
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.activeScene.update(deltaTime);
        this.lastFrameTime = currentTime;
        requestAnimationFrame(this.gameLoop);
    }

    start() {
        // do checks hreer brefore starting game loop
        requestAnimationFrame(this.gameLoop);
    }
}
