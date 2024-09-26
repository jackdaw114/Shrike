import { testVert,testFrag } from "./shaders.js"  
import { mat4,glMatrix } from "gl-matrix";

export default class Renderer{

    #context
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas,aspect_ratio){
        this.aspect_ratio = aspect_ratio;
        this.#context = canvas.getContext("webgl2")
        if (!this.#context) {
            console.error("Web Gl Not Supported")
        }
        this.#context.enable(this.#context.DEPTH_TEST)
        this.#context.enable(this.#context.CULL_FACE)
        this.#context.frontFace(this.#context.CCW)
        this.#context.cullFace(this.#context.BACK)
    }





    // the smallest gl setup possible
    /**
    * @param {Float32Array} vertex_data
    */
    test(vertex_positions, indices) {
        const vertex_shader = this.createShader(this.#context.VERTEX_SHADER,testVert)
        const fragment_shader = this.createShader(this.#context.FRAGMENT_SHADER, testFrag)
        const test_program = this.createProgram(vertex_shader,fragment_shader) 
      
        this.#context.useProgram(test_program)


        const buffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER,buffer)
        this.#context.bufferData(this.#context.ARRAY_BUFFER,vertex_positions,this.#context.STATIC_DRAW)

        const positionLocation = this.#context.getAttribLocation(test_program,'a_position');
        const colorLocation = this.#context.getAttribLocation(test_program, 'a_color');

        this.#context.enableVertexAttribArray(positionLocation)
        this.#context.enableVertexAttribArray(colorLocation)
        this.#context.vertexAttribPointer(positionLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,0);
        this.#context.vertexAttribPointer(colorLocation, 3, this.#context.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);

        const matWorldUniformLocation = this.#context.getUniformLocation(test_program, 'mWorld')
        const matViewUniformLocation = this.#context.getUniformLocation(test_program, 'mView')
        const matProjUniformLocation = this.#context.getUniformLocation(test_program, 'mProj')
        
        let identityMatrix = new Float32Array(16)
        mat4.identity(identityMatrix)

        let worldMatrix = new Float32Array(16)
        let viewMatrix = new Float32Array(16)
        let projMatrix = new Float32Array(16)
        mat4.identity(worldMatrix)
        mat4.rotate(worldMatrix,identityMatrix,3.14,[0,1,0])

        mat4.perspective(projMatrix,glMatrix.toRadian(45),this.aspect_ratio,0.1,1000.0)
        mat4.lookAt(viewMatrix,[1,2,-5],[0,0,0],[0,1,0])

        this.#context.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
        this.#context.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)
        this.#context.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)

        const indexBuffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.#context.bufferData(this.#context.ELEMENT_ARRAY_BUFFER, indices, this.#context.STATIC_DRAW);

        this.#context.clearColor(1.0,1.0,1.0,1.0)
        this.#context.clear(this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT)
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
