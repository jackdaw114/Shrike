import {Scene, System} from "../ecs/classes.js";
import { testVert,testFrag } from "./shaders.js"  
import { mat4,glMatrix } from "gl-matrix";



export default class Renderer extends System{
    static POS_SIZE = 3;
    static COLOR_SIZE = 3;
    static POS_OFFSET = 0;
    static COLOR_OFFSET;
    static VERTEX_SIZE = 6;
    static VERTEX_SIZE_IN_BYTES;
    #context
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas,aspect_ratio){
        super()
        this.aspect_ratio = aspect_ratio;
        this.#context = canvas.getContext("webgl2")
        this.COLOR_OFFSET = this.POS_OFFSET + this.POS_SIZE * this.#context.FLOAT;
        this.VERTEX_SIZE_IN_BYTES = this.VERTEX_SIZE * this.#context.FLOAT;

        if (!this.#context) {
            console.error("Web Gl Not Supported")
        }
        this.#context.enable(this.#context.DEPTH_TEST)
        this.#context.enable(this.#context.CULL_FACE)
        this.#context.frontFace(this.#context.CCW)
        this.#context.cullFace(this.#context.BACK)
        const vertex_shader = this.createShader(this.#context.VERTEX_SHADER,testVert)
        const fragment_shader = this.createShader(this.#context.FRAGMENT_SHADER, testFrag)
        this.test_program = this.createProgram(vertex_shader,fragment_shader) 
        this.#context.useProgram(this.test_program)

        this.#context.clearColor(1.0,1.0,1.0,1.0)
    }



    /**
        * @param {Scene} scene
        */
    update(deltaTime){
        // octree culling here then provide updated array to the loop below
        this.tempFun()

    }

    
    init() {
        console.log(this.components["Geometry"])
        for (const component of this.components["Geometry"]) {
            console.log(component)
            this.initGeometry(component)             
        }
    }
    
    initGeometry(component) {
        console.log(component)
        component.vaoID = this.#context.createVertexArray();
        this.#context.bindVertexArray(component.vaoID)
        component.vboID = this.#context.createBuffer(); 
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER,component.vboID)
        this.#context.bufferData(this.#context.ARRAY_BUFFER,component.vertices.length * this.#context.FLOAT, this.#context.DYNAMIC_DRAW)
         
        const positionLocation = this.#context.getAttribLocation(this.test_program,'a_position');
        const colorLocation = this.#context.getAttribLocation(this.test_program, 'a_color');
        
        this.#context.enableVertexAttribArray(positionLocation)
        this.#context.enableVertexAttribArray(colorLocation)
        
        //TODO: figure out vertex buffer layout properly
        this.#context.vertexAttribPointer(positionLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,0);
        this.#context.vertexAttribPointer(colorLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);

        component.eboID = this.#context.createBuffer() 
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, component.eboID);
        this.#context.bufferData(this.#context.ELEMENT_ARRAY_BUFFER, component.indices, this.#context.STATIC_DRAW);
    }


    tempFun() {
        for (const component of this.components["Geometry"]) {
            console.log("drawing")
            this.render(component)
        }
    }
    
    render(component) {
        this.#context.bindVertexArray(component.vaoID)
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID)

        this.#context.bufferSubData(this.#context.ARRAY_BUFFER, 0, component.vertices) 


        this.#context.enableVertexAttribArray(this.#context.getAttribLocation(this.test_program, 'a_color'))
        this.#context.enableVertexAttribArray(this.#context.getAttribLocation(this.test_program, 'a_position'))


        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, component.eboID)
        this.#context.useProgram(this.test_program)

        const matWorldUniformLocation = this.#context.getUniformLocation(this.test_program, 'mWorld')
        const matViewUniformLocation = this.#context.getUniformLocation(this.test_program, 'mView')
        const matProjUniformLocation = this.#context.getUniformLocation(this.test_program, 'mProj')
        
        let identityMatrix = new Float32Array(16)
        mat4.identity(identityMatrix)


        //TODO:- Transformation Matrix
        let worldMatrix = mat4.create()
        let viewMatrix = new Float32Array(16)
        let projMatrix = new Float32Array(16)

        mat4.perspective(projMatrix,glMatrix.toRadian(45),this.aspect_ratio,0.1,1000.0)
        mat4.lookAt(viewMatrix,[1,2,-5],[0,0,0],[0,1,0])

        this.#context.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
        this.#context.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)
        this.#context.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
        this.#context.drawElements(this.#context.TRIANGLES,component.indices.length,this.#context.UNSIGNED_SHORT,0)
    }


    /**
        * @param {Float32Array} vertex_data
        * @param {Transformation} transformation
        */
    test(vertex_positions, indices, transformation) {
        const buffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER,buffer)
        this.#context.bufferData(this.#context.ARRAY_BUFFER,vertex_positions,this.#context.STATIC_DRAW)

        const positionLocation = this.#context.getAttribLocation(this.test_program,'a_position');
        const colorLocation = this.#context.getAttribLocation(this.test_program, 'a_color');

        this.#context.enableVertexAttribArray(positionLocation)
        this.#context.enableVertexAttribArray(colorLocation)
        this.#context.vertexAttribPointer(positionLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,0);
        this.#context.vertexAttribPointer(colorLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);

        const matWorldUniformLocation = this.#context.getUniformLocation(this.test_program, 'mWorld')
        const matViewUniformLocation = this.#context.getUniformLocation(this.test_program, 'mView')
        const matProjUniformLocation = this.#context.getUniformLocation(this.test_program, 'mProj')
        
        let identityMatrix = new Float32Array(16)
        mat4.identity(identityMatrix)

        let worldMatrix = transformation.matrix
        let viewMatrix = new Float32Array(16)
        let projMatrix = new Float32Array(16)

        mat4.perspective(projMatrix,glMatrix.toRadian(45),this.aspect_ratio,0.1,1000.0)
        mat4.lookAt(viewMatrix,[1,2,-5],[0,0,0],[0,1,0])

        this.#context.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
        this.#context.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)
        this.#context.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)

        const indexBuffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.#context.bufferData(this.#context.ELEMENT_ARRAY_BUFFER, indices, this.#context.STATIC_DRAW);

        this.#context.drawElements(this.#context.TRIANGLES,indices.length,this.#context.UNSIGNED_SHORT,0)
    }

     createProgram(vertexShader,fragmentShader) {
        const program = this.#context.createProgram();
        this.#context.attachShader(program,vertexShader)
        this.#context.attachShader(program,fragmentShader)
        this.#context.linkProgram(program)
        if(!this.#context.getProgramParameter(program,this.#context.LINK_STATUS)){
            console.error("failed to link program")
            this.#context.deleteProgram(program)
            return null
        }
        return program
    }

    createShader(type,source){
        const shader = this.#context.createShader(type)
        this.#context.shaderSource(shader,source)
        this.#context.compileShader(shader)
        if(!this.#context.getShaderParameter(shader,this.#context.COMPILE_STATUS)){
        console.error('Shader compilation failed:', this.#context.getShaderInfoLog(shader));
            this.#context.deleteShader(shader)
            return null
        }
        return shader
    }
}    
