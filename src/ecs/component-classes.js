import {mat4} from "gl-matrix";
import {Component, Transformation} from "./classes";

export class Geometry extends Component{
    /**
        * @param {Float32Array} VBO
        * @param {Uint16Array} IBO
        * @param {Transformation} transformation
        */
    constructor(VBO,IBO,transformation) {
        super()
        this.VBO = VBO;
        this.IBO = IBO;
        this.transformation = transformation
    } 
}

