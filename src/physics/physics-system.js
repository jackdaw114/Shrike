import CANNON from "cannon";
import { System } from "../ecs/classes";
import { quat } from "gl-matrix";

export class PhysicsSystem extends System {
    constructor(scene, fixedTime = 1/60, maxSubSteps = 3, options = {}) {
        super(scene);
        
        // Default physics world options
        this.defaultOptions = {
            gravity: new CANNON.Vec3(0, 0, -9.81),
            broadphase: new CANNON.NaiveBroadphase(),
            allowSleep: true,
            sleepSpeedLimit: 0.01,
            sleepTimeLimit: 10,
            solver: new CANNON.GSSolver(),
            defaultContactMaterial: {
                friction: 0.3,
                restitution: 0.3
            }
        };

        // Merge default options with provided options
        this.options = { ...this.defaultOptions, ...options };
        
        // Create the physics world
        this.world = new CANNON.World();
        this.world.gravity.copy(this.options.gravity);
        this.world.broadphase = this.options.broadphase;
        this.world.allowSleep = this.options.allowSleep;
        this.world.sleepSpeedLimit = this.options.sleepSpeedLimit;
        this.world.sleepTimeLimit = this.options.sleepTimeLimit;
        this.world.solver = this.options.solver;

        // Set up default contact material
        this.defaultMaterial = new CANNON.Material("default");
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            this.options.defaultContactMaterial
        );
        this.world.addContactMaterial(this.defaultContactMaterial);
        this.world.defaultContactMaterial = this.defaultContactMaterial;

        this.fixedTime = fixedTime;
        this.maxSubSteps = maxSubSteps;
        this.isRunning = false;
        this.bodies = new Map(); // Map to store entity-bodies relationships
    }

    start() {
        this.isRunning = true;
        console.log("starting physics system")
        for (const [entityId, body] of this.bodies) {

            const entity = this.scene.getEntityById(entityId);
            const transform = entity.getComponent("Transformation");
            body.position.set(transform.position.x, transform.position.y, transform.position.z);
            body.velocity.set(0, 0, 0);
            body.angularVelocity.set(0, 0, 0);
        }   
    }

    stop() {
        this.isRunning = false;
        console.log("stopping physics system")
    }

    init() {
        if (!this.scene.componentRegister.hasOwnProperty("PhysicsBody")) {
            console.warn(
                "The current scene is missing a PhysicsBody component. Please add a PhysicsBody component to enable the physics system, or detach the physics system."
            );
            return;
        }

        // Initialize all physics bodies
        for (const component of this.scene.componentRegister["PhysicsBody"]) {
            if (component.initialized) continue;
            this.addBody(component.entity, component.body);
            component.initialized = true;
        }
    }

    addBody(entity, body) {
        this.world.addBody(body);
        this.bodies.set(entity.id, body);
    }

    removeBody(entity) {
        const body = this.bodies.get(entity.id);
        if (body) {
            this.world.removeBody(body);
            this.bodies.delete(entity.id);
        }
    }

    addContactMaterial(material1, material2, options) {
        const contactMaterial = new CANNON.ContactMaterial(material1, material2, options);
        this.world.addContactMaterial(contactMaterial);
        return contactMaterial;
    }

    setGravity(x, y, z) {
        this.world.gravity.set(x, y, z);
    }

    update(deltaTime) {
        if (!this.isRunning) return;
        console.log("updating physics system")
        // Step the physics world
        this.world.step(deltaTime/1000);
        console.log(this.bodies)
        // Update entity transformations based on physics bodies
        for (const [entityId, body] of this.bodies) {
            const entity = this.scene.getEntityById(entityId);
            if (!entity) 
                continue;

            const transform = entity.getComponent("Transformation");
            if (!transform) continue;
            // Update position
            transform.setPosition(body.position);
            // Update rotation
            console.log("body quaternion",body.quaternion)
            transform.quaternion =quat.fromValues(body.quaternion.x,body.quaternion.y,body.quaternion.z,body.quaternion.w)
            transform.updateMatrix()
        }
    }

    destroy() {
        // Clean up all physics bodies
        for (const body of this.bodies.values()) {
            this.world.removeBody(body);
        }
        this.bodies.clear();
    }
} 