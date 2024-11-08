import { Entity, Scene } from "../ecs/classes";

export class Shrike {
    lastFrameTime = 0;

    entity_uid = 1;
    component_uid = 1;
    scene_uid = 1;
    system_uid = 1;

    /**
     * Initializes a new game instance with canvas and dimensions
     * @param {HTMLCanvasElement} canvas - The canvas element to render the game on
     * @param {number} width - The width of the canvas in pixels
     * @param {number} height - The height of the canvas in pixels
     * @property {number} CANVAS_WIDTH - The fixed canvas width
     * @property {number} CANVAS_HEIGHT - The fixed canvas height
     * @property {Object.<string, Scene>} scenes - Collection of game scenes
     * @property {Object.<string, Entity>} entities - Collection of game entities
     * @property {string} activeScene - The currently active scene identifier
     */
    constructor(canvas, width, height) {
        this.CANVAS_WIDTH = canvas.width = width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.scenes = {};
        this.systems = {};
        this.entities = {};
        this.activeScenes = [];
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * @param {Scene} scene
     */
    createScene() {
        const scene = new Scene();
        this.scenes[this.scene_uid] = scene;

        if (!Object.keys(this.activeScenes).length) {
            this.activeScenes.push(this.scenes[this.scene_uid]);
        }
        this.scene_uid++;
        return scene;
    }
    activateScene(scene) {
        this.activeScenes.push(scene)
    }

    createSystem(Constructor,scene, ...args) {
        const system = new Constructor(scene, ...args);

        this.systems[this.system_uid] = system;
        this.system_uid++;
        return system;
    }

    /**
     * @param {Scene} scene
     */
    createEntity(scene) {
        const entity = new Entity(this.entity_uid);
        this.entities[this.entity_uid] = entity;
        scene.addEntity(entity);
        this.entity_uid++;
        return entity;
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        for (const scene of this.activeScenes) {
            scene.update(deltaTime);
        }
        this.lastFrameTime = currentTime;
        requestAnimationFrame(this.gameLoop);
    }

    start() {
        if (!Object.keys(this.activeScenes).length) {
            throw new Error(
                "No active scene found. Please create a scene or set an existing one as active."
            );
        }
        // do checks hreer brefore starting game loop
        requestAnimationFrame(this.gameLoop);
    }
    init() {
        for (const scene of Object.values(this.scenes)) {
            console.log(scene);
            scene.init();
        }
    }
}
