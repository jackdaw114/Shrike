import { Component, Scene, System } from "../../ecs/classes.js";
import { Geometry } from "../../ecs/component-classes.js";
import Shader from "../shaders.js";
import { mat4, glMatrix } from "gl-matrix";
import {
    compositorFragmentShader,
    compositorVertexShader,
} from "../../asset-manager/shader/compositor.js";
import { createFramebuffer } from "../framebuffer.js";
import { testFrag, testVert } from "../../asset-manager/shader-assets";
import {
    shadowFragmentShader,
    shadowVertexShader,
} from "../../asset-manager/shader/shadow.js";

export class Renderer extends System {
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
    constructor(scene, context, aspect_ratio, width, height) {
        super(scene);

        this.aspect_ratio = aspect_ratio;
        this.width = width;
        this.height = height;
        this.#context = context;
        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);
        this.shader = new Shader(this.#context, testVert, testFrag, [
            "mWorld",
            "mView",
            "mProj",
            "diffuseColor",
            "specularColor",
            "shininess",
            "ambientColor",
            "lightPosition",
        ]);

        this.framebuffer = createFramebuffer(this.#context, {
            width: width,
            height: height,
        });
        this.createShadowDepthBuffer();
    }

    update(deltaTime) {
        // octree culling here then provide updated array to the loop below

        this.renderPass();
    }

    getFramebuffer() {
        return this.framebuffer;
    }

    createShadowDepthBuffer() {
        this.shadowBuffer = createFramebuffer(this.#context, {
            width: this.width,
            height: this.height,
            depth: true,
        });
        this.shadowProgram; //= new Shader(this.#context,shadowVertexShader,shadowFragmentShader,[])
    }

    init() {
        if (!this.scene.componentRegister.hasOwnProperty("Geometry")) {
            console.warn(
                "The current scene is missing a Geometry component. Please add a Geometry component to enable the renderer, or detach the renderer."
            );
            return;
        }
        for (const component of this.scene.componentRegister["Geometry"]) {
            if (!component.vaoID) {
                this.initGeometry(component);
            }
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

    renderPass() {
        // render pass
        this.#context.viewport(
            0,
            0,
            this.framebuffer.width,
            this.framebuffer.height
        );
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.framebuffer.fbo
        );
        this.#context.useProgram(this.shader.getProgram());

        this.#context.bindTexture(
            this.#context.TEXTURE_2D,
            this.framebuffer.texture
        );
        this.#context.clearColor(0, 0, 0, 0);
        this.#context.clear(
            this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT
        );
        if (!this.scene.componentRegister.hasOwnProperty("Geometry")) {
            return;
        }
        for (const component of this.scene.componentRegister["Geometry"]) {
            if (component.render) {
                this.render(component);
            }
        }
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, null);
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, null);
        this.#context.bindRenderbuffer(this.#context.RENDERBUFFER, null);
        this.#context.bindTexture(this.#context.TEXTURE_2D, null);
    }

    shadowPass(component) {
        let worldMatrix = component.entity
            .getComponent("Transformation")
            .getMatrix();
        let lightView;

        this.#context.bindFramebuffer(
            this.#context.DRAW_FRAMEBUFFER,
            this.shadowBuffer.fbo
        );
        this.#context.viewport(
            0,
            0,
            this.shadowBuffer.width,
            this.shadowBuffer.height
        );
        this.#context.clear(this.#context.DEPTH_BUFFER_BIT);
        this.#context.useProgram(this.shadowProgram);
        for (const component of this.scene.componentRegister["Geometry"]) {
            if (component.render) {
                this.shadowPass(component);
            }
        }
    }

    /**
     * @param {Geometry} component
     */
    render(component) {
        this.#context.bindVertexArray(component.vaoID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID);
        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            component.eboID
        );
        this.#context.bufferSubData(
            this.#context.ARRAY_BUFFER,
            0,
            component.vertices
        );

        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = component.entity
            .getComponent("Transformation")
            .getMatrix();

        const camera = this.scene.getCamera();
        let viewMatrix = this.scene.getCamera().matrix;
        let projMatrix = camera.getProjMatrix();

        this.#context.uniformMatrix4fv(
            this.shader.getUniform("mWorld"),
            false,
            worldMatrix
        );

        this.#context.uniformMatrix4fv(
            this.shader.getUniform("mProj"),
            false,
            projMatrix
        );
        this.#context.uniformMatrix4fv(
            this.shader.getUniform("mView"),
            false,
            viewMatrix
        );

        this.#context.uniform3fv(
            this.shader.getUniform("diffuseColor"),
            component.material.getDiffuse()
        );

        this.#context.uniform3fv(
            this.shader.getUniform("specularColor"),
            component.material.getSpecular()
        );

        this.#context.uniform1f(
            this.shader.getUniform("shininess"),
            component.material.getShininess()
        );
        this.#context.uniform3fv(
            this.shader.getUniform("ambientColor"),
            component.material.getAmbient()
        );
        this.#context.uniform3fv(
            this.shader.getUniform("lightPosition"),
            camera.position 
        );
        this.#context.drawElements(
            this.#context.TRIANGLES,
            component.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }
}

function checkGLError(gl, operation) {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error(`WebGL error after ${operation}: ${error}`);
    }
}
