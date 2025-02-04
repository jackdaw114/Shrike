import { mat4, quat } from "gl-matrix";
import Camera from "./camera";

export class Entity {
    constructor(id,name) {
        this.id = id;
        this.name = name;
        /**
         * @type {Object}
         */
        this.components = {};
    }
    getComponent(componentName, index = 0) {
        if (this.components.hasOwnProperty(componentName)) {
            return this.components[componentName][index]; // get by id here
        }
        throw new Error(
            "Entity",
            this.id,
            "Doesnt have",
            componentName,
            "Component"
        );
    }
}

export class Component {
    /**
     * @property {Entity} entity
     */
    constructor() {
        // take entity reference here
        this.entity;
    }
}

export class Scene {
    constructor() {
        this.entities = {};
        this.systems = {};
        this.componentRegister = {};
        this.isRunning = false;
        this.activeCamera = new Camera();
    }
    setCamera(camera) {
        this.activeCamera = camera;
    }

    /*
     * @param {System} system
     */
    attachSystem(system) {
        this.systems[system.constructor.name] = system;
        if (!system.scene) {
            system.scene = this;
        }
    }

    createEntity() {
        const id = this.nextEntityId++;
        const entity = new Entity(id);
        this.entities[id] = entity;
        return entity;
    }
    addEntity(id, entity) {
        this.entities[id] = entity;
    }

    removeEntity(entity) {
        this.removeComponents(entity);
        this.entities.delete(entity.id);
    }
    getEntityById(id) {
        return this.entities[id]
    }
    addComponent(entity, component) {
        const componentClass = component.constructor.name;
        if (!entity.hasOwnProperty(componentClass)) {
            entity.components[componentClass] = [component];
        } else {
            entity.components[componentClass] = [
                ...entity.components[componentClass],
                component,
            ];
        }
        component.entity = entity; // for component reference a workaround this would be required
        if (!this.componentRegister.hasOwnProperty(componentClass)) {
            this.componentRegister[componentClass] = [];
        }
        let components = this.componentRegister[componentClass];
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
            const list = this.componentRegister.get(key);
            const index = list.indexOf(value);
            list.splice(index, 1);
        });
    }

    removeSystem(system) {}

    init() {
        for (const system of Object.values(this.systems)) {
            system.init();
        }
        this.isRunning = true;
    }
    update(deltaTime) {
        for (const system of Object.values(this.systems)) {
            system.update(deltaTime);
        }
    }
    getCamera() {
        return this.activeCamera;
    }
}

export class System {
    /**
     * @property {Scene} entity
     */
    constructor(scene) {
        this.components = {};
        this.scene = scene;
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
        this.scene = scene;
        // prolly call its init funciton here create a destructor like deinit first ig
    }
    start() {
        throw new Error("Method 'start' must be implemented.");
    }
    stop() {
        throw new Error("Method 'stop' must be implemented.");
    }
}

// TODO: move this into some other file
export class Transformation extends Component {
    constructor() {
        super();
        this.matrix = mat4.create();
        this.quaternion = quat.create();
        this.position = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.scale = {
            x: 1,
            y: 1,
            z: 1,
        };
        this.dirtyTransform = false;
    }
    getMatrix() {
        return this.matrix;
    }
    setXPos(value) {
        this.matrix[12] = value
    }
}
