import {mat4} from "gl-matrix";
import {Component} from "./classes";

export class Geometry extends Component{
    /**
        * @param {Float32Array} VBO
        * @param {Uint16Array} IBO
        */
    constructor(VBO,IBO,transformation) {
        super()
        this.VBO = VBO;
        this.IBO = IBO;
        this.transformation = transformation
    } 
}

export class Transformation extends Component{
    constructor() {
        super()
        this.matrix = mat4.create()
    }
}
