import {glMatrix, mat4} from "gl-matrix";
import { parseOBJ } from "../../../lib/parse-obj";
import { testFrag, testVert } from "../../asset-manager/shader/cannon-renderer";
import { System } from "../../ecs/classes";
import { createFramebuffer } from "../framebuffer";
import Shader from "../shaders";
import { ball } from "./assets";
import { boxArrayFromHalfExtents } from "../../../lib/util/box-from-halfextents";
import { box } from "../../../assets/box";

export class CannonRenderer extends System {
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
    MAX_INSTANCES = 100;
    /**
     * @type {WebGL2RenderingContext}
     */
    #context;
    /**
     * @param {WebGL2RenderingContext} canvas
     */
    constructor(scene, context,framebuffer,physicsSystem, aspect_ratio, width, height) {
        super(scene);

        this.aspect_ratio = aspect_ratio;
        this.width = width;
        this.height = height;
        this.#context = context;
        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);
        this.physicsSystem = physicsSystem

        this.sphereVAOID = this.#context.createVertexArray();
        this.sphereVBOID = this.#context.createBuffer();

        this.#context.bindVertexArray(this.sphereVAOID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.sphereVBOID);

        //this.instanceVAOID = this.#context.createBuffer(); 

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
            this.COLOR_SIZE,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.COLOR_OFFSET
        );

        this.sphereEBOID = this.#context.createBuffer();

        this.boxVAOID = this.#context.createVertexArray();
        this.boxVBOID = this.#context.createBuffer();
        this.boxEBOID = this.#context.createBuffer();

        this.#context.bindVertexArray(this.boxVAOID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.boxVBOID);
        this.#context.enableVertexAttribArray(0);
        this.#context.enableVertexAttribArray(1);
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
            this.COLOR_SIZE,
            this.#context.FLOAT,
            false,
            this.VERTEX_SIZE_IN_BYTES,
            this.COLOR_OFFSET
        );
        this.shader = new Shader(this.#context, testVert, testFrag, [
            "mWorld",
            "mView",
            "mProj",
        ]);

        this.framebuffer = framebuffer;
    }
    stop(){
        this.isRunning = false;
    }
    start(){
        this.isRunning = true;
    }
    async init() {
        this.sphereShape = await parseOBJ(ball);
         
        // Set up the vertex buffer data after we have the parsed shape
        this.#context.bindBuffer(
            this.#context.ARRAY_BUFFER,
            this.sphereVBOID
        );
        this.#context.bufferData(
            this.#context.ARRAY_BUFFER,
            this.sphereShape.vertices,
            this.#context.STATIC_DRAW
        );

        // Set up the element buffer data
        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.sphereEBOID
        );
        this.#context.bufferData(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.sphereShape.indices,
            this.#context.STATIC_DRAW
        );



        // **************************  **************************
        this.boxShape = boxArrayFromHalfExtents([1,1,1])
        this.#context.bindBuffer(
            this.#context.ARRAY_BUFFER,
            this.boxVBOID
        );
        this.#context.bufferData(
            this.#context.ARRAY_BUFFER,
            this.boxShape.vertices,
            this.#context.STATIC_DRAW
        );
        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.boxEBOID
        );
        this.#context.bufferData(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.boxShape.indices,
            this.#context.STATIC_DRAW
        );
    }
    /**
     *
     * @param {CANNON.Body} body
     */
    initGeometry(body) {
        for (const shape in body) {
            if (shape.constructor.name === "Sphere") {
                
            }
        }
    }
    initializeBody(body){
        this.physicsSystem.addBody(body.entity,body.body)
    }
    forceReload(){
    }
    update(deltaTime) {
        if (!this.scene.componentRegister.hasOwnProperty("PhysicsBody")) return;
        this.shader.use();
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.framebuffer.fbo
        );
        this.#context.viewport(
            0,
            0,
            this.framebuffer.width,
            this.framebuffer.height
        );
        
        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        const camera = this.scene.getCamera();
        const viewMatrix = camera.matrix;
        const projMatrix = camera.getProjMatrix();

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
        for (const body of this.scene.componentRegister["PhysicsBody"]){
            if (!body.initialized)
                this.initializeBody(body)

            if (body.body.shapes[0].type === 1){
                this.renderSphere(body)
            }
            else if (body.body.shapes[0].type === 4){
                this.renderBox(body)
            }
        }
    }

    
    renderSphere(body){
        const scale = body.body.shapes[0].radius
        const worldMatrix = mat4.create()
        let bodyPosition = Object.values(body.body.position)
        bodyPosition= [bodyPosition[0],bodyPosition[2],bodyPosition[1]]
        mat4.translate(worldMatrix,worldMatrix,bodyPosition)
        mat4.scale(worldMatrix,worldMatrix, [scale,scale,scale])
        this.#context.bindVertexArray(this.sphereVAOID);
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, this.sphereEBOID);
        this.#context.uniformMatrix4fv(
            this.shader.getUniform("mWorld"),
            false,
            worldMatrix
        );
        this.#context.drawElements(
            this.#context.LINE_LOOP,
            this.sphereShape.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );

    }
    renderBox(body){
        const bodyHalfExtents = Object.values(body.body.shapes[0].halfExtents)
        this.#context.bindVertexArray(this.boxVAOID);
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, this.boxEBOID);
        let bodyPosition = Object.values(body.body.position)
        bodyPosition= [bodyPosition[0],bodyPosition[2],bodyPosition[1]]
        console.log("body position",bodyPosition)
        
        const worldMatrix = mat4.create()
        mat4.translate(worldMatrix,worldMatrix,bodyPosition)
        mat4.scale(worldMatrix,worldMatrix,bodyHalfExtents)
        this.#context.uniformMatrix4fv(
            this.shader.getUniform("mWorld"),
            false,
            worldMatrix
        );
        this.#context.drawElements(
            this.#context.LINE_LOOP,
            this.boxShape.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }
}
