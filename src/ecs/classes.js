import { mat4, quat, vec3 } from "gl-matrix";
import Camera from "./camera";
import { Geometry } from "./component-classes";

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
        else{
            return null
        }
    }
    updateAllComponents(){
        console.log("components",this.components)
        for (const component of Object.values(this.components)) {
            component[0].updateSelf()
        }
    }
}

export class Component {
    /**
     * @property {Entity} entity
     */
    constructor() {
        // take entity reference here
        this.type = this.constructor.name;
        this.entity;
    }
    fromJSON(json){
        for (const key in json){
            this[key] = json[key]
        }
    }
    updateSelf(){
        console.warn("Method 'updateSelf' must be implemented.");
    }
}

export class Scene {
    constructor(width,height) {

        this.entities = {};
        this.systems = {};
        this.componentRegister = {};
        this.isRunning = true;
        this.activeCamera = new Camera();
        this.width = width;
        this.height =height
    }
    stop(){
        this.isRunning = false;
        console.log("stopping scene")
        for (const system of Object.values(this.systems)) {
            system.stop();
        }
    }
    start(systems = []){
        this.isRunning = true;
        if(systems.length > 0){
            for (const system of systems) {
                system.start()
            }
            return
        }
        for (const system of Object.values(this.systems)) {
            system.start();
        }
    }
    forceReload(){
        console.log("componentRegister",this.componentRegister)
        for (const system of Object.values(this.systems)) {
            system.forceReload();
        }
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
        const componentClass = component.type;
        console.log("adding component to class",componentClass) 
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
       // if (this.isRunning) {
       //     for (const [system, system_component] of this.systems) {
       //         if (componentClass in system_component) {
       //             system.addComponent(componentClass);
       //         }
       //     }
       // }
    }

    removeComponent(entity, component) {
        const componentClass = component.type;
        
        // Remove from entity's components
        if (entity.components[componentClass]) {
            const index = entity.components[componentClass].indexOf(component);
            if (index !== -1) {
                entity.components[componentClass].splice(index, 1);
                if (entity.components[componentClass].length === 0) {
                    delete entity.components[componentClass];
                }
            }
        }

        // Remove from component register
        if (this.componentRegister[componentClass]) {
            const registerIndex = this.componentRegister[componentClass].indexOf(component);
            if (registerIndex !== -1) {
                this.componentRegister[componentClass].splice(registerIndex, 1);
                if (this.componentRegister[componentClass].length === 0) {
                    delete this.componentRegister[componentClass];
                }
            }
        }

        // Clear component's entity reference
        component.entity = null;
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
    forceReload(){
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
    constructor(u_values = {}) {
        super();
        const defaultValues = {
            Tx: 0,
            Ty: 0,
            Tz: 0,
            Rx:0,
            Ry:0,
            Rz:0,
            Sx:1,
            Sy:1,
            Sz:1,
        }

        const values= {...defaultValues,...u_values}
        this.matrix = mat4.create();
        this.rotation = {
            x: values.Rx,
            y: values.Ry,
            z: values.Rz,
        };

        this.quaternion = quat.create();
        quat.fromEuler(this.quaternion, values.Rx,values.Ry,values.Rz)
        this.position = {
            x: values.Tx,
            y: values.Ty,
            z: values.Tz,
        };
        this.scale = {
            x: values.Sx,
            y: values.Sy,
            z: values.Sz,
        };
        this.dirtyTransform = false;
        this.updateMatrix()
    }
    getMatrix() {
        return this.matrix;
    }
    
    setScale(x = 1, y = 1, z = 1) {
        const newScale = {x,y,z}
        const keys = Object.keys(this.scale)
        if (keys.every(key => this.scale[key] === newScale[key])) {
            return
        }
        mat4.scale(this.matrix,this.matrix,[x/this.scale.x,y/this.scale.y,z/this.scale.z]) 
        this.scale = {
            x,y,z
        }
    }
    translate(x,y,z){
        this.position = {
            x:this.position.x+x,
            y:this.position.y+y,
            z:this.position.z+z,
        }
        this.updateMatrix()
    }
    setPosition(position){
        this.position = position
        this.updateMatrix()
    }
    setPositionX(x){
        this.position.x = x
        this.updateMatrix()
    }
    setPositionY(y){
        this.position.y = y
        this.updateMatrix()
    }
    setPositionZ(z){
        this.position.z = z
        this.updateMatrix()
    }
    setRotation(quaternion) {
        console.log("setting rotation",quaternion)
        this.quaternion = quat.fromValues(quaternion.x,quaternion.y,quaternion.z,quaternion.w)
        const rotationMatrix = mat4.create()
        mat4.fromQuat(rotationMatrix,this.quaternion)
        console.log("rotationMatrix",rotationMatrix)
        mat4.multiply(this.matrix,this.matrix,rotationMatrix)
        console.log("matrix",this.matrix)
    }
    spin(value){
        this.rotation.x += value.x
        this.rotation.y += value.y
        this.rotation.z += value.z
        this.updateRotation()
    }
    updateRotation(){
        quat.fromEuler(this.quaternion,this.rotation.x,this.rotation.z,this.rotation.y)
        this.updateMatrix()
    }
    updateMatrix() {
        mat4.fromRotationTranslationScale(this.matrix, this.quaternion, vec3.fromValues(this.position.x, this.position.z, this.position.y), vec3.fromValues(this.scale.x, this.scale.z, this.scale.y))
    }
}
