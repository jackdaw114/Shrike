import {glMatrix, mat4} from "gl-matrix"

export default class Camera {
    constructor() {
        this.matrix = mat4.create()
        this.position = [0,-1,0]
        this.target = [0,0,0]
        this.up = [0,0,1]
    }
    getRight() {
        return this.matrix.slice(0,4)
    }
    getUp() {
        return this.matrix.slice(4,8)
    }
}
