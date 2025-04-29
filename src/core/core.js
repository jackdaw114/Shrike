import { safeStringify } from "../../lib/util/safe-stringify";
import { Entity, Scene, Transformation } from "../ecs/classes";
import { Geometry, PhysicsBody, Script } from "../ecs/component-classes";
import {Compositor} from "./compositor/compositor";

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
     * @property {Object} entities - Collection of game entities
     * @property {string} activeScene - The currently active scene identifier
     */
    constructor(canvas, width, height) {
        this.CANVAS_WIDTH = canvas.width = width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.scenes = {};
        this.systems = {};
        this.entities = [];
        this.activeScenes = [];
        this.gameLoop = this.gameLoop.bind(this);
        this.compositor = new Compositor(canvas.getContext("webgl2"), width / height, width, height)
    }

    /**
     * @param {Scene} scene
     */
    createScene(width,height) {
        const scene = new Scene(width,height);
        this.scenes[this.scene_uid] = scene;

        this.scene_uid++;
        return scene;
    }
    activateScene(scene) {
        this.activeScenes.push(scene)
    }

    /**
     *
     * @param {Scene} scene 
     * @returns 
     */
    createSystem(Constructor,scene, ...args) {
        const system = new Constructor(scene, ...args);
        scene.attachSystem(system)
        this.systems[this.system_uid] = system;
        this.system_uid++;
        return system;
    }

    /**
     * @param {Scene} scene
     */
    createEntity(scene) {
        const entity = new Entity(this.entity_uid,"entity-"+(this.entity_uid));
        this.entities[this.entity_uid] = entity;
        scene.addEntity(this.entity_uid,entity);
        console.trace("entity created")
        this.entity_uid++;
        return entity;
    }
    framerate = 60;
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        const currFramerate =1000/deltaTime
        this.framerate = currFramerate
        for (const scene of this.activeScenes) {
            scene.update(deltaTime);
        }


        this.lastFrameTime = currentTime;
        this.compositor.render()
        requestAnimationFrame(this.gameLoop);
    }

    start() {
        if (!Object.keys(this.activeScenes).length) {
            console.warn(
                "No active scene found. Please create a scene or set an existing one as active."
            );
            return;
        }
        // do checks hreer brefore starting game loop
        requestAnimationFrame(this.gameLoop);
    }
    init() {
        for (const scene of Object.values(this.scenes)) {
            scene.init();
        }
    }

    /**
     * Saves the current entities to a JSON file
     * @param {string} filename - The name of the file to save to
     */
    async saveEntitiesToFile(filename,scene) {
        const serializedEntities = Object.values(scene.entities).map(entity => {

            if (!entity) return null;

            return {
                id: entity.id,
                name: entity.name,
                components: Object.values(entity.components).map(component => {
                    if(component[0].constructor.name === "DebugLine") {
                        return
                    }
                    return {
                        type: component[0].constructor.name,
                        data: safeStringify(component[0],["entity"],["vaoID","vboID","iboID","programID"])
                    }
                })
            };
        }).filter(entity => entity !== null);

        const blob = new Blob([JSON.stringify(serializedEntities, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Loads entities from a JSON file
     * @param {File} file - The file to load entities from
     * @param {Scene} scene - The scene to add the loaded entities to
     * @returns {Promise<void>}
     */
    async loadEntitiesFromFile(file, scene) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const serializedEntities = JSON.parse(event.target.result);
                    
                    // Clear existing entities if needed
                    this.entities = [];
                    this.entity_uid = 1;
                    serializedEntities.forEach(serializedEntity => {
                        const entity = new Entity(this.entity_uid, serializedEntity.name);
                        this.entities[this.entity_uid] = entity;
                        if(serializedEntity.components !== null) {
                        serializedEntity.components.forEach(serializedComponent => {
                            if ( serializedComponent?.data !== undefined) {
                                 
                                switch(JSON.parse(serializedComponent.data).type){
                                    case "Geometry":
                                        let geometry = new Geometry()
                                        geometry.fromJSON(JSON.parse(serializedComponent.data))
                                        scene.addComponent(entity,geometry)
                                        break;
                                    case "Transformation":
                                        let transformation = new Transformation()
                                        transformation.fromJSON(JSON.parse(serializedComponent.data))
                                        scene.addComponent(entity,transformation)
                                        break;
                                    case "PhysicsBody":
                                        let physicsBody = new PhysicsBody()
                                        physicsBody.fromJSON(JSON.parse(serializedComponent.data))
                                        scene.addComponent(entity,physicsBody)
                                        break;
                                    case "Script":
                                        let script = new Script()
                                        script.fromJSON(JSON.parse(serializedComponent.data))
                                        scene.addComponent(entity,script)
                                        break;
                                    default:
                                        scene.addComponent(entity,JSON.parse(serializedComponent.data))
                                }
                                
                            }
                        });
                    }
                        scene.addEntity(this.entity_uid, entity);
                        this.entity_uid++;
                    });
                    scene.forceReload();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
    
    });
    }
}