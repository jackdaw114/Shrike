class Entity {
    constructor(id) {
        this.id = id;
        /**
         * @type {Object}
         */
        this.components = {};
    }
}

class Component {
    constructor() {
        this.entity;
    }
}

class System {
    constructor() {
        this.components = [];
    }

    update(deltaTime) {}
}

class Scene {
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
        this.entities.delete(entity.id);
    }

    addComponent(entity, component) {
        const componentClass = component.constructor.name;
        entity.components[componentClass] = component;
        component.entity = entity;
        if (!this.componentMaps.has(componentClass)) {
            this.componentMaps.set(componentClass, []);
        }
        this.componentMaps.get(componentClass).push(component);
    }

    removeComponents(entity) {
        Object.entries(entity.components).forEach(([key, value]) => {
            const list = this.componentMaps.get(key);
            const index = list.indexOf(value);
            list.splice(index, 1);
        });
    }

    addSystem(system, requiredComponents) {}

    removeSystem(system) {}

    update(deltaTime) {}

    getMask(components) {}
}
