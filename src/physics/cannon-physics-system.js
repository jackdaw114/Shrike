import CANNON from "cannon"
import {System} from "../ecs/classes"

export class CannonPhysicsSystem extends System{
    constructor(scene,fixedTime,maxSubSteps,options) {
        super(scene)
        this.defaultOptions = {
            gravity:new CANNON.Vec3(0,0,-9.82),
            broadphase:new CANNON.NaiveBroadphase(),
            allowSleep:true,
            sleepSpeedLimit:0.01,
            sleepTimeLimit:10
        }
        this.options = {...this.defaultOptions,...options}
        this.gravity = this.options.gravity
        this.world = new CANNON.World(this.gravity)
        this.world.broadphase = this.options.broadphase
        this.world.allowSleep = this.options.allowSleep
        this.world.sleepSpeedLimit = this.options.sleepSpeedLimit
        this.world.sleepTimeLimit = this.options.sleepTimeLimit
        this.fixedTime = fixedTime
        this.maxSubSteps = maxSubSteps
        this.isRunning = false
    }
    start(){
        this.isRunning = true
    }
    stop(){
        this.isRunning = false
    }   
    init() {
        if (!this.scene.componentRegister.hasOwnProperty("CannonObject")) {
            console.warn(
                "The current scene is missing a CannonObject component. Please add a CannonObject component to enable the physics system, or detach the physics system."
            );
            return;
        }
        for (const component of this.scene.componentRegister["CannonObject"]) {
            if(component.initialized) continue;
            this.world.addBody(component.body)
            component.initialized = true
        }
    }

    update(deltaTime) {
        if(this.isRunning){
            this.world.step(this.fixedTime, deltaTime, this.maxSubSteps);
            for (const component of this.scene.componentRegister["CannonObject"]) {
                if(component.initialized){
                    // component.entity.getComponent("Transformation").setPosition(component.body.position)
                }
            }
        }
    }
}