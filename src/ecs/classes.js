import { mat4 } from "gl-matrix";

export class Transformation {
    constructor() {
        this.matrix = mat4.create();
    }
    getMatrix() {
        return this.matrix;
    }
}

class Entity {
    constructor(id) {
        this.id = id;
        /**
         * @type {Object}
         */
        this.components = {};
        this.transformation = new Transformation();
    }
    getTransformation() {
        return this.transformation;
    }
    getComponent(componentName) {
        if (this.components.hasOwnProperty(componentName)) {
            return this.components[componentName];
        }
        console.error(
            "Entity",
            this.id,
            " Doesnt have ",
            componentName,
            " Component"
        );
        return null;
    }
}

export class Component {
    constructor() {// take entity reference here
        this.entity;
    }
}

export class System {
    constructor(scene) {
        this.components = {};
        this.scene = scene
    }

    update(deltaTime) {
        throw new Error("Method 'update' must be implemented.");
    }
    init() {
        throw new Error("Method 'init' must be implemented.");
    }
    addComponent(componentClass) {
        throw new Error("Method 'addComponent' must be implemented.");
    }
    changeScene(scene) {
        this.scene = scene
        // prolly call its init funciton here create a destructor like deinit first ig 
    }
}

export class Scene {
    nextEntityId = 0;
    constructor() {
        this.entities = {};
        this.systems = new Map();
        this.componentMaps = {};
        this.isRunning = false;
        this.activeCamera;
    }
    setCamera(camera) {
        this.activeCamera = camera
    }

    createEntity() {
        const id = this.nextEntityId++;
        const entity = new Entity(id);
        this.entities[id] = entity;
        return entity;
    }

    removeEntity(entity) {
        this.removeComponents(entity);
        this.entities.delete(entity.id);
    }

    addComponent(entity, component) {
        const componentClass = component.constructor.name;
        entity.components[componentClass] = component;
        component.entity = entity;
        if (!this.componentMaps.hasOwnProperty(componentClass)) {
            this.componentMaps[componentClass] = [];
        }
        let components = this.componentMaps[componentClass];
        components.push(component);
        if (this.isRunning) {
            for (const [system, system_component] of this.systems) {
                if (componentClass in system_component) {
                    system.addComponent(componentClass);
                }
            }
        }
    }

    removeComponents(entity) {
        Object.entries(entity.components).forEach(([key, value]) => {
            const list = this.componentMaps.get(key);
            const index = list.indexOf(value);
            list.splice(index, 1);
        });
    }

    addSystem(system, requiredComponents) {
        this.systems.set(system, requiredComponents);
        for (let component of requiredComponents) {
            system.components[component] = this.componentMaps[component];
        }
    }

    removeSystem(system) {}

    init() {
        for (const [system, reqComponents] of this.systems) {
            console.log("initializing :",system)
            system.init();
        }
        this.isRunning = true;
    }
    update(deltaTime) {
        for (const [system, reqComponents] of this.systems) {
            system.update(deltaTime);
        }
    }
    getCamera() {
        return this.activeCamera.matrix
    }
}
