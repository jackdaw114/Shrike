import {mat4} from "gl-matrix";


export class Transformation{
    constructor() {
        this.matrix = mat4.create()
    }
}

class Entity {
    constructor(id) {
        this.id = id;
        /**
         * @type {Object}
         */
        this.components = {};
        this.transformation = new Transformation() 
    }
    getComponent(componentName) {
        if (this.components.hasOwnProperty(componentName)) {
            return this.components[componentName]
        }
        console.error("Entity", this.id, " Doesnt have ",componentName," Component")
        return null
    }

    

}

export class Component {
    constructor() {
        this.entity;
    }
}

export class System {
    constructor() {
        this.components = new Map();
    }

    update(deltaTime) {
        throw new Error("Method 'update' must be implemented.");
    }
    init() {
        throw new Error("Method 'init' must be implemented.");
    }
}

export class Scene {
    constructor() {
        this.entities = new Map();
        this.systems = new Map();
        this.componentMaps = new Map();
        this.nextEntityId = 0;
    }

    createEntity() {
        const id = this.nextEntityId++;
        const entity = new Entity(id);
        this.entities.set(id, entity);
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
        if (!this.componentMaps.has(componentClass)) {
            this.componentMaps.set(componentClass, []);
        }
        let components = this.componentMaps.get(componentClass);
        components.push(component);
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
            let tempComponent = this.componentMaps.get(component)
            system.components.set(component,tempComponent);
            
        }
    }

    removeSystem(system) {}
    

    init() {
        for (const system in this.systems) {
            system.init()
        }
    }
    update(deltaTime) {
        for (const [system,reqComponents] of this.systems) {
            system.update(deltaTime)
        }
    }
    
}
