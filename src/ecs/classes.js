export class Scene{
    /**
        * @param {Number} id
        * @param {String} name
        */
    constructor(id,name) {
        this.id = id;
        this.name = name;
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
    }
}

export class Geometry{
    /**
        * @param {Number} id
        * @param {String} name
        * @param {Float32Array} vertexList
        * @param {Uint16Array} indexList
        */
    constructor(id, name, vertexList, indexList) {
        this.id = id;
        this.name = name;
        this.vertexList = vertexList;
        this.indexList = indexList;
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
