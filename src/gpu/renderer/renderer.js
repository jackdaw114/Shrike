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
        console.log("this is aspect_ratio", aspect_ratio);
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
            height:height,
        });

        console.log(this.framebuffer);
        this.options = {
            clear: true,
        };
    }

    update(deltaTime) {
        // octree culling here then provide updated array to the loop below

        this.tempFun();
    }

    getFramebuffer() {
        return this.framebuffer;
    }

    init() {
        if (!this.scene.componentRegister.hasOwnProperty("Geometry")) {
            throw new Error(
                "The current scene is missing a Geometry component. Please add a Geometry component to enable the renderer, or detach the renderer."
            );
        }
        for (const component of this.scene.componentRegister["Geometry"]) {
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
        this.#context.useProgram(this.shader.getProgram());
        //this.#context.clearColor(0.3, 0.3, 0.3, 1.0);
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.framebuffer.fbo
            //null  // once compositor is doen use frame buffer herer
        );

        this.#context.viewport(
            0,
            0,
            this.framebuffer.width,
            this.framebuffer.height
        );

        this.#context.bindTexture(
            this.#context.TEXTURE_2D,
            this.framebuffer.texture
        );
        if (this.options.clear) {
            this.#context.clear(
                this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT
            );
        }
        for (const component of this.scene.componentRegister["Geometry"]) {
            if (component.render) {
                if (!component.depthTest) {
                    this.#context.disable(this.#context.DEPTH_TEST);
                }
                this.render(component);
                if (!component.depthTest) {
                    this.#context.enable(this.#context.DEPTH_TEST);
                }
            }
        }
    }

    /**
     * @param {Geometry} component
     */
    render(component) {
        //console.log(this.framebuffer)
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.framebuffer.fbo
        );
        this.#context.bindVertexArray(component.vaoID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID);

        this.#context.bufferSubData(
            this.#context.ARRAY_BUFFER,
            0,
            component.vertices
        );

        //this.#context.enableVertexAttribArray(0);
        //this.#context.enableVertexAttribArray(1);

        //        this.#context.bindBuffer(
        //           this.#context.ELEMENT_ARRAY_BUFFER,
        //         component.eboID
        //      );

        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = component.entity
            .getComponent("Transformation")
            .getMatrix();

        let viewMatrix = this.scene.getCamera();
        let projMatrix = new Float32Array(16);
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(45),
            this.aspect_ratio,
            0.1, // get from camera
            1000.0 // get from camera
        );
        // ************************** setUniforms *******************************
        //TODO: create some sort of Uniform location holder

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
            [10, 10, 0]
        );
        this.#context.uniform1f(
            this.#context.getUniformLocation(
                this.shader.getProgram(),
                "shininess"
            ),
            component.material.getShininess()
        );
        //this.#context.uniform3fv(this.#context.getUniform, data)

        // ************************** END *******************************
        this.#context.drawElements(
            this.#context.TRIANGLES,
            component.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }
}
