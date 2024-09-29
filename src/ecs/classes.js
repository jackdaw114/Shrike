import { mat4 } from "gl-matrix";

export class Scene{
    constructor() {
        /**
            * @type {GameObject[]}
            */
        this.gameObjectArray = []
        this.cameraArray = []
        this.lightArray = []
    }
}

export class GameObject{
    /**
        * @param {Number} id
        * @param {String} name
        */
    constructor(id,name) {
        this.id = id;
        this.name = name;
        /**
            * @type {Geometry[]}
            */
        this.geometry=[];
    }
}

export class Transformation{
    constructor() {
        this.matrix = mat4.create();
    }
}

export class Geometry{
    /**
        * @param {String} name
        * @param {Number} id
        * @param {GeometryData} geometryData
        * @param {Transformation} transformation
        */
    constructor(id,name,geometryData, transformation) {
        this.name = name;
        this.id = id;
        this.geometryData = geometryData;
        this.transformation = transformation;
    }
    
}

export class GeometryData{
    /**
        * @param {Number} id
        * @param {Float32Array} vertexList
        * @param {Uint16Array} indexList
        */
    constructor(id, vertexList, indexList) {
        this.id = id;
        this.vertexList = vertexList;
        this.indexList = indexList;
    }

}

// Axis aligned bounding box
export class AABB{
    /**
        * @param {Number} id
        */
    constructor(id, top, bottom, right, left, near, far) {
        
    }
}

export class Texture{
    /**
        * @param {Number} id
        * @param {String} name
        * @param {Image} texture
        */
    constructor(id, name,texture) {
        this.id = id;
        this.name = name;
        this.texture = texture;
    }

}

export class Material{
    /**
        * @param {Number} id
        * @param {String} name
        */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class PerspectiveCamera{
    /**
        * @param {Number} id
        * @param {String} name
        * @param {Array<3>} position
        * @param {Array<3>} lookAt
        * @param {Array<3>} up
        */
    constructor(id,name,fov,aspectRatio,near,far,position = [0, 0, -1], lookAt = [0, 0, 0], up = [0, 1, 0]) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.lookAt = lookAt;
        this.up = up;
        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
    }
}

export class SpotLight{
    /**
        * @param {Number} id
        * @param {String} name
        */
    constructor(id,name,intensity,position = [0, 0, -1], lookAt = [0, 0, 0], up = [0, 1, 0]) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.lookAt = lookAt;
        this.up = up;
        this.intensity = intensity;
        // TODO light properties (resolution, max bounces)
    }
}
