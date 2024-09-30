import {Scene} from "../ecs/classes";
import Renderer from "../graphics/renderer";

export class Shrike{
    lastFrameTime=0;
    /**
        * @param {HTMLCanvasElement} canvas
        */
    constructor(canvas,width,height) {
        this.CANVAS_WIDTH = canvas.width = width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.renderer = new Renderer(canvas,this.CANVAS_WIDTH/this.CANVAS_HEIGHT)
        /**
            * @type {Object}
            */
        this.scenes={}
        /**
            * @tyep {String} 
            */
        this.activeScene;
        this.gameLoop = this.gameLoop.bind(this)
    }
// generrate data from json file?

    /**
        * @param {Scene} scene
        */
    addScene(scene,name) {
        if (!(this.scenes.hasOwnProperty(name))) {

            this.scenes[name] = scene
            console.log(this.scenes)
            if (this.activeScene == null) {
                this.activeScene = name
            }
        }
    }

    testFunciton(func) {
        this.testFunc = func
    }
    
    gameLoop(currentTime) {
        this.renderer.renderScene(this.scenes[this.activeScene]) 
        // script processor 
         
        this.testFunc() 
        const deltaTime = currentTime - this.lastFrameTime;

        this.lastFrameTime = currentTime;
        requestAnimationFrame(this.gameLoop)
    }


    start() { // do checks hreer brefore starting game loop
        requestAnimationFrame(this.gameLoop) 
    }
}
