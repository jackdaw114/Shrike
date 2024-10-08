import {mat4} from "gl-matrix";
import {Component, Transformation} from "./classes";

export class Geometry extends Component{
    /**
        * @param {Float32Array} vertices
        * @param {Uint16Array} indices
        * @param {Transformation} transformation
        */
    constructor(vertices,indices) {
        super()
        this.vertices = vertices;
        this.indices = indices;
        this.texture = 0
    } 
}

