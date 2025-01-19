import CANNON from "cannon"
import {System} from "../ecs/classes"

export class CannonPhysicsSystem extends System{
    constructor(scene,fixedTime,maxSubSteps,options) {
        super(scene)
        this.defaultOptions = {

        }
        this.options = {...this.defaultOptions,...options}
        this.gravity = new CANNON.Vec3()
        this.world = new CANNON.World({gravity:this.gravity})
        this.fixedTime = fixedTime
        this.maxSubSteps = maxSubSteps
    }
    init() {

    }

    update(deltaTime) {
        this.world.step(this.fixedTime, deltaTime, this.maxSubSteps);
    }
}

