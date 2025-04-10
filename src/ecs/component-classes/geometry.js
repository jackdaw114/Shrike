import { Component } from "../classes";
import { Material } from "../../material/material";

export class Geometry extends Component {
    /**
     * @param {Float32Array} vertices
     * @param {Uint16Array} indices
     * @param {Material} material
     */
    constructor(vertices, indices, material = new Material(
        new Float32Array([0.6, 0.6, 0.6]),
        new Float32Array([0.2, 0.2, 0.2]),
        new Float32Array([0.9, 0.9, 0.9]),
        99
    )) {
        super();
        this.vertices = vertices;
        this.indices = indices;
        this.texture = 0;
        this.render = true;
        this.depthTest = true;
        this.material = material;
        this.initialized = false;
    }

    materialOptions(params) {
        const {
            diffuseColor = new Float32Array([1.0, 1.0, 1.0]),
            ambientColor = new Float32Array([1.0, 1.0, 1.0]),
            specularColor = new Float32Array([1.0, 1.0, 1.0]),
            shininess = 0.
        } = params;
        this.material = new Material(diffuseColor, ambientColor, specularColor, shininess);
    }
} 