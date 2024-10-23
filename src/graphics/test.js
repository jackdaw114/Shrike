
import { Component, Scene, System } from "../ecs/classes.js";
import Shader from "./shaders.js";
import { mat4, glMatrix } from "gl-matrix";
import { testFrag,testVert } from "../assent-manager/shader-assets.js";

export default class TestRenderer extends System {

    /**
     * @type {WebGL2RenderingContext}
     */
    #context;
    /**
     * @param {WebGL2RenderingContext} canvas
     */
    constructor(scene,width,height, context) {
        super(scene);
        this.aspect_ratio = width/height;
        this.#context = context;
        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);

        this.shader = new Shader(this.#context, testVert, testFrag);

        this.pickerFramebuffer = this.#context.createFramebuffer();
        this.pickerDepthTexture = this.#context.createTexture();
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.pickerFramebuffer
        );

        this.initTexture(width, height);
        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, null);
        this.#context.bindTexture(this.#context.TEXTURE_2D, null);
    }

    initTexture(width, height) {
        this.pickerTexture = this.#context.createTexture();
        this.#context.bindTexture(this.#context.TEXTURE_2D, this.pickerTexture);
        this.#context.texParameteri(
            this.#context.TEXTURE_2D,
            this.#context.TEXTURE_WRAP_S,
            this.#context.REPEAT
        );
        this.#context.texParameteri(
            this.#context.TEXTURE_2D,
            this.#context.TEXTURE_WRAP_T,
            this.#context.REPEAT
        );
        this.#context.texParameteri(
            this.#context.TEXTURE_2D,
            this.#context.TEXTURE_MAG_FILTER,
            this.#context.NEAREST
        );
        this.#context.texParameteri(
            this.#context.TEXTURE_2D,
            this.#context.TEXTURE_MIN_FILTER,
            this.#context.NEAREST
        );
        this.#context.texImage2D(
            this.#context.TEXTURE_2D,
            0,
            this.#context.RGBA32F,
            width,
            height,
            0,
            this.#context.RGBA,
            this.#context.FLOAT,
            null
        );

        this.#context.framebufferTexture2D(
            this.#context.FRAMEBUFFER,
            this.#context.COLOR_ATTACHMENT0,
            this.#context.TEXTURE_2D,
            this.pickerTexture,
            0
        );

        this.#context.bindTexture(
            this.#context.TEXTURE_2D,
            this.pickerDepthTexture
        );
        this.#context.texImage2D(
            this.#context.TEXTURE_2D,
            0,
            this.#context.DEPTH_COMPONENT24,
            width,
            height,
            0,
            this.#context.DEPTH_COMPONENT,
            this.#context.UNSIGNED_INT,
            null
        );
        this.#context.framebufferTexture2D(
            this.#context.FRAMEBUFFER,
            this.#context.DEPTH_ATTACHMENT,
            this.#context.TEXTURE_2D,
            this.pickerDepthTexture,
            0
        );

        if (
            this.#context.checkFramebufferStatus(this.#context.FRAMEBUFFER) !==
            this.#context.FRAMEBUFFER_COMPLETE
        ) {
            console.error("Framebuffer is not complete");
        }
    }
    update(deltaTime) {
        this.#context.useProgram(this.shader.getProgram())
        for (const component of this.scene.componentMaps["Geometry"]) {
            this.render(component);

        }
    }

    /**
     * @param {Component} component
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
