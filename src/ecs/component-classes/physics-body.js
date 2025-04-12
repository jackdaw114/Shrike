import CANNON from "cannon";
import { Component } from "../classes";

export class PhysicsBody extends Component {
    constructor(options = {}) {
        super();
        
        // Default physics body options
        this.defaultOptions = {
            mass: 0, // Static body by default
            position: new CANNON.Vec3(0, 0, 0),
            shape: new CANNON.Sphere(1),
            material: new CANNON.Material(),
            linearDamping: 0.01,
            angularDamping: 0.01,
            fixedRotation: false,
            collisionResponse: true
        };

        // Merge default options with provided options
        this.options = { ...this.defaultOptions, ...options };

        // Create the physics body
        this.body = new CANNON.Body({
            mass: this.options.mass,
            position: this.options.position,
            material: this.options.material,
            linearDamping: this.options.linearDamping,
            angularDamping: this.options.angularDamping,
            fixedRotation: this.options.fixedRotation,
            collisionResponse: this.options.collisionResponse
        });

        // Add the shape to the body
        this.body.addShape(this.options.shape);

        this.initialized = false;
    }

    setMass(mass) {
        this.body.mass = mass;
        this.body.updateMassProperties();
    }

    setPosition(x, y, z) {
        this.body.position.set(x, y, z);
    }

    setVelocity(x, y, z) {
        this.body.velocity.set(x, y, z);
    }

    setAngularVelocity(x, y, z) {
        this.body.angularVelocity.set(x, y, z);
    }

    applyForce(force, point) {
        this.body.applyForce(force, point);
    }

    applyImpulse(impulse, point) {
        this.body.applyImpulse(impulse, point);
    }

    applyLocalForce(force, point) {
        this.body.applyLocalForce(force, point);
    }

    applyLocalImpulse(impulse, point) {
        this.body.applyLocalImpulse(impulse, point);
    }

    addEventListener(event, callback) {
        this.body.addEventListener(event, callback);
    }

    removeEventListener(event, callback) {
        this.body.removeEventListener(event, callback);
    }

    removeShape(shape) {
        if (!shape) return;
        const index = this.body.shapes.indexOf(shape);
        if (index !== -1) {
            this.body.shapes.splice(index, 1);
            this.body.updateBoundingRadius();
        }
    }

    destroy() {
        // Clean up any event listeners or other resources
        this.body = null;
    }
} 