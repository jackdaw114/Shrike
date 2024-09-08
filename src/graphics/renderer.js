import { testVert,testFrag } from "./shaders.js"  

export default class Renderer{

    #context
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas){
        this.#context = canvas.getContext("webgl2")
        if (!this.#context) {
            console.error("Web Gl Not Supported")
        }
    }
   

    // the smallest gl setup possible
    /**
    * @param {Float32Array} vertex_data
    */
    test(vertex_data) {
        const vertex_shader = this.createShader(this.#context.VERTEX_SHADER,testVert)
        const fragment_shader = this.createShader(this.#context.FRAGMENT_SHADER, testFrag)
        const test_program = this.createProgram(vertex_shader,fragment_shader) 
      
        this.#context.useProgram(test_program)
        const vertices = new Float32Array([
            0.0,  0.5,  // Vertex 1 (x, y)
            -0.5, -0.5,  // Vertex 2 (x, y)
            0.5, -0.5   // Vertex 3 (x, y)
        ]); 

        const buffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER,buffer)
        this.#context.bufferData(this.#context.ARRAY_BUFFER,vertices,this.#context.STATIC_DRAW)
       
        const positionLocation = this.#context.getAttribLocation(test_program,'a_position');
         
        this.#context.enableVertexAttribArray(positionLocation)
        this.#context.vertexAttribPointer(positionLocation,2,this.#context.FLOAT,false,0,0)

        this.#context.clearColor(0.0,0.0,0.0,1.0)
        this.#context.clear(this.#context.COLOR_BUFFER_BIT)
        this.#context.drawArrays(this.#context.TRIANGLES,0,3)


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

    
