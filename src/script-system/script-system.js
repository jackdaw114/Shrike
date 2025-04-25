import { System } from "../ecs/classes";
import CANNON from "cannon";
export class ScriptSystem extends System {
    constructor(scene,eventHandler) {
        super(scene);
        this.isStarted = false
        this.eventHandler = eventHandler
        console.log("eventHandler", eventHandler)
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
        if (!this.scene.componentRegister.hasOwnProperty("Script")) return;
        if (!this.isStarted) return;
        for (const script of this.scene.componentRegister["Script"]) {
            if(script.update)
                script.update(deltaTime,CANNON,script.entity.components,this.scene,this.eventHandler.activeKeys);
        }
    }
    start() {
        this.isStarted =true
        if (!this.scene.componentRegister.hasOwnProperty("Script")) return;
        for (const script of this.scene.componentRegister["Script"]) {
            if(script.init)
                script.init(CANNON,script.entity.components,this.scene);
        }
    }
    pause() {
        this.isStarted= false
    }
    stop() {
        // here serialization & deserialization is kinda imp
    }
}
