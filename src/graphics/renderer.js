import { Component, Scene, System } from "../ecs/classes.js";
import {Geometry} from "../ecs/component-classes.js";
import Shader, { testVert, testFrag } from "./shaders.js";
import { mat4, glMatrix } from "gl-matrix";

export default class Renderer extends System {
    POS_SIZE = 3;
    COLOR_SIZE = 3;
    UV_SIZE = 2;
    TEXTURE_ID_SIZE = 1;

    POS_OFFSET = 0;
    COLOR_OFFSET =
        this.POS_OFFSET + this.POS_SIZE * Float32Array.BYTES_PER_ELEMENT;
    UV_OFFSET =
        this.COLOR_OFFSET + this.COLOR_SIZE * Float32Array.BYTES_PER_ELEMENT;

    TEXTURE_ID_OFFSET =
        this.UV_OFFSET + this.UV_SIZE * Float32Array.BYTES_PER_ELEMENT;

    VERTEX_SIZE =
        this.POS_SIZE + this.COLOR_SIZE + this.UV_SIZE + this.TEXTURE_ID_SIZE;
    VERTEX_SIZE_IN_BYTES = this.VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;

    /**
     * @type {WebGL2RenderingContext}
     */
    #context;
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
        this.shader = new Shader(this.#context, testVert, testFrag);
        this.#context.clearColor(1.0, 1.0, 1.0, 1.0);


    }

    update(deltaTime) {
        // octree culling here then provide updated array to the loop below
        
        this.tempFun();
    }

    init() {
        for (const component of this.components["Geometry"]) {
            this.initGeometry(component);
        }
    }


    /**
     * @param {Component} component
     */
    initGeometry(component) {
        component.vaoID = this.#context.createVertexArray();
        this.#context.bindVertexArray(component.vaoID);
        component.vboID = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID);
        this.#context.bufferData(
            this.#context.ARRAY_BUFFER,
            component.vertices.length * Float32Array.BYTES_PER_ELEMENT,
            this.#context.DYNAMIC_DRAW
        );


        this.#context.enableVertexAttribArray(0);
        this.#context.enableVertexAttribArray(1);

        //TODO: figure out vertex buffer layout properly
        this.#context.vertexAttribPointer(
            0,
            this.POS_SIZE,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.POS_OFFSET
        );
        this.#context.vertexAttribPointer(
            1,
            3,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.COLOR_OFFSET
        );

        component.eboID = this.#context.createBuffer();
        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            component.eboID
        );
        this.#context.bufferData(
            this.#context.ELEMENT_ARRAY_BUFFER,
            component.indices,
            this.#context.STATIC_DRAW
        );
    }

    tempFun() {
        this.#context.useProgram(this.shader.getProgram())
        this.#context.clear(this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT)
        for (const component of this.components["Geometry"]) {
            this.render(component);

        }
    }

    /**
     * @param {Geometry} component
     */
    render(component) {
        this.#context.bindVertexArray(component.vaoID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID);

        this.#context.bufferSubData(
            this.#context.ARRAY_BUFFER,
            0,
            component.vertices
        );

        this.#context.enableVertexAttribArray(
            this.#context.getAttribLocation(this.shader.getProgram(), "a_color")
        );
        this.#context.enableVertexAttribArray(
            this.#context.getAttribLocation(
                this.shader.getProgram(),
                "a_position"
            )
        );

        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            component.eboID
        );

        const matWorldUniformLocation = this.#context.getUniformLocation(
            this.shader.getProgram(),
            "mWorld"
        );
        const matViewUniformLocation = this.#context.getUniformLocation(
            this.shader.getProgram(),
            "mView"
        );
        const matProjUniformLocation = this.#context.getUniformLocation(
            this.shader.getProgram(),
            "mProj"
        );

        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = component.entity.transformation.getMatrix();
        let viewMatrix = this.scene.getCamera();
        let projMatrix = new Float32Array(16);
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(45),
            this.aspect_ratio,
            0.1, // get from camera
            1000.0 // get from camera
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

        this.#context.drawElements(
            this.#context.TRIANGLES,
            component.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }
}
