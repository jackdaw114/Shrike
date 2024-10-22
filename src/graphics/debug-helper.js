import { mat4, glMatrix } from "gl-matrix";
import { System } from "../ecs/classes";
import { testVert, testFrag } from "./shaders.js";

export default class DebugSystem extends System {
    POS_SIZE = 3;
    COLOR_SIZE = 3;
    POS_OFFSET = 0;
    COLOR_OFFSET =
        this.POS_OFFSET + this.POS_SIZE * Float32Array.BYTES_PER_ELEMENT;
    VERTEX_SIZE = this.POS_SIZE + this.COLOR_SIZE;
    VERTEX_SIZE_IN_BYTES = this.VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
    /**
     * @type {WebGL2RenderingContext}
     */
    #context;

    /**
     * @type {WebGLBuffer}
     */
    vaoID;
    vboID;
    started = false;
    MAX_LINES = 500;

    /**
     * @param {WebGL2RenderingContext} canvas
     */
    constructor(scene, context, aspect_ratio) {
        super(scene);
        this.aspect_ratio = aspect_ratio;
        this.#context = context;

        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);

        // TODO:- change this to some other function prolly called in init and has some sort of dynamic override maybe
        const vertex_shader = this.createShader(
            this.#context.VERTEX_SHADER,
            testVert
        );
        const fragment_shader = this.createShader(
            this.#context.FRAGMENT_SHADER,
            testFrag
        );
        this.test_program = this.createProgram(vertex_shader, fragment_shader);
        this.#context.useProgram(this.test_program);

        this.vaoID = this.#context.createVertexArray();
        this.#context.bindVertexArray(this.vaoID);
        this.vboID = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.vboID);

        this.#context.bufferData(
            this.#context.ARRAY_BUFFER,
            this.MAX_LINES * Float32Array.BYTES_PER_ELEMENT,
            this.#context.DYNAMIC_DRAW
        );

        const positionLocation = this.#context.getAttribLocation(
            this.test_program,
            "a_position"
        );
        const colorLocation = this.#context.getAttribLocation(
            this.test_program,
            "a_color"
        );
        this.#context.enableVertexAttribArray(positionLocation);
        this.#context.enableVertexAttribArray(colorLocation);
        this.#context.vertexAttribPointer(
            positionLocation,
            this.POS_SIZE,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.POS_OFFSET
        );
        this.#context.vertexAttribPointer(
            colorLocation,
            this.COLOR_SIZE,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.COLOR_OFFSET
        );
    }

    init() {}

    update(deltaTime) {
        for (const component of this.scene.componentMaps["DebugLine"]) {
            this.render(component);
        }
    }

    render(component) {
        if (component.arrayBuffer.length == 0) {
            return;
        }
        this.#context.bindVertexArray(this.vaoID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.vboID);

        this.#context.bufferSubData(
            this.#context.ARRAY_BUFFER,
            0,
            new Float32Array(component.arrayBuffer)
        );

        this.#context.enableVertexAttribArray(
            this.#context.getAttribLocation(this.test_program, "a_color")
        );
        this.#context.enableVertexAttribArray(
            this.#context.getAttribLocation(this.test_program, "a_position")
        );

        this.#context.useProgram(this.test_program);

        const matWorldUniformLocation = this.#context.getUniformLocation(
            this.test_program,
            "mWorld"
        );
        const matViewUniformLocation = this.#context.getUniformLocation(
            this.test_program,
            "mView"
        );
        const matProjUniformLocation = this.#context.getUniformLocation(
            this.test_program,
            "mProj"
        );

        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = mat4.create();
        let viewMatrix = this.scene.getCamera();
        let projMatrix = new Float32Array(16);

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(45),
            this.aspect_ratio,
            0.1,
            1000.0
        );

        this.#context.uniformMatrix4fv(
            matWorldUniformLocation,
            false,
            worldMatrix
        );
        this.#context.uniformMatrix4fv(
            matProjUniformLocation,
            false,
            projMatrix
        );
        this.#context.uniformMatrix4fv(
            matViewUniformLocation,
            false,
            viewMatrix
        );

        this.#context.drawArrays(
            this.#context.LINES,
            0,
            component.arrayBuffer.length / (6) //TODO: constafiy
        );
        // TODO: this.#context.disableVertexAttribArray()
    }
    createProgram(vertexShader, fragmentShader) {
        const program = this.#context.createProgram();
        this.#context.attachShader(program, vertexShader);
        this.#context.attachShader(program, fragmentShader);
        this.#context.linkProgram(program);
        if (
            !this.#context.getProgramParameter(
                program,
                this.#context.LINK_STATUS
            )
        ) {
            console.error("failed to link program");
            this.#context.deleteProgram(program);
            return null;
        }
        return program;
    }

    createShader(type, source) {
        const shader = this.#context.createShader(type);
        this.#context.shaderSource(shader, source);
        this.#context.compileShader(shader);
        if (
            !this.#context.getShaderParameter(
                shader,
                this.#context.COMPILE_STATUS
            )
        ) {
            console.error(
                "Shader compilation failed:",
                this.#context.getShaderInfoLog(shader)
            );
            this.#context.deleteShader(shader);
            return null;
        }
        return shader;
    }
}
