import { System } from "../ecs/classes";

export class ScriptSystem extends System {
    constructor(scene) {
        super(scene);
        this.isStarted = false
    }
    init() {
        if (!this.scene.componentRegister.hasOwnProperty("Script")) {
            console.warn(
                "The current scene is missing a Script component. Please add a Script component to enable the script system, or detach the script system."
            );
            return
        }
        for (const script in this.scene.componentRegister["Script"]) {
            // some script optimization potential
        }
    }
    update(deltaTime) { // event data access 
        if (!this.isStarted) {
            return
        }
        for (const script of this.scene.componentRegister["Script"]) {
            script.update(deltaTime, script.entity.components);
        }
    }
    start() {
        this.isStarted =true
    }
    pause() {
        this.isStarted= false
    }
    stop() {
        // here serialization & deserialization is kinda imp
    }
}
