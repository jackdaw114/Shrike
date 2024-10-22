export const testVert = `#version 300 es
        precision mediump float;

        in vec3 a_position;
        in vec3 a_color;

        out vec3 v_color;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;


        void main(void){
            gl_Position = mProj * mView * mWorld * vec4(a_position,1.0);
            v_color = a_color;
        }
    `
export const testFrag = `#version 300 es
        precision mediump float;
        in vec3 v_color;
        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            outColor = vec4(v_color,1.0);
        }`


export default class Shader{
    vertexShader;
    fragmentShader;
    program;
    #context;
    constructor() {

    }
    getProgram(){
        return this.program
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
