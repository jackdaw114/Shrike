import {glMatrix, mat4, vec3} from "gl-matrix"
import {Component} from "./classes"


// too much going on even if its simd calculations
export default class Camera extends Component{
    constructor() {
        super()
        this.matrix = mat4.create()
        this.position = [0,0,-1]
        this.target = [0,0,0]
        this.up = [0,1,0]
        
        this.forward = vec3.create() 
        console.log(this.forward)
        this.right =vec3.create() 
        this.calculateRight()
    }
    calculateRight() {
        this.calculateForward()
        
        vec3.cross(this.right, this.up, this.forward)
        this.calculateUp()
        this.normalizeAll()
    }
    calculateForward() {
        vec3.sub(this.forward, this.target, this.position)
    }
    calculateUp() {
        vec3.cross(this.up, this.forward, this.right)
        console.log(this.up)
    }

    normalizeAll() {
        vec3.normalize(this.up, this.up)
        vec3.normalize(this.forward, this.forward)
        vec3.normalize(this.right, this.right)
    }

    setPosition(position) {
        this.position = position
        this.calculateRight()

        //vec3.cross(this.right, a, b)
        this._calculateMatrix()
    }
    setTarget(target) {
        this.target = target
        this._calculateMatrix()
    }
    _calculateMatrix() {

        console.log(this.forward, this.right)
        mat4.lookAt(this.matrix, this.position, this.target, this.up)
    }
    
    panHorizontal(amount) {
        let tempVec = vec3.create();
        
        vec3.add(this.target,this.right.map(e=>e*amount),this.target)
        vec3.add(tempVec, this.right.map(e=>e*amount), this.position)
        
        this.setPosition(tempVec)
    }
    panVertical(amount) {
        let tempVec = vec3.create();
        
        vec3.add(this.target,this.up.map(e=>e*amount),this.target)
        vec3.add(tempVec, this.up.map(e=>e*amount), this.position)
        
        this.setPosition(tempVec)
    }
    zoom(amount) {

        let tempVec = vec3.create();
        
        vec3.add(this.target,this.forward.map(e=>e*amount),this.target)
        vec3.add(tempVec, this.forward.map(e=>e*amount), this.position)
        
        this.setPosition(tempVec)
    }
    
}
