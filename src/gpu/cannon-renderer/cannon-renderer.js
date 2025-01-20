import {glMatrix, mat4} from "gl-matrix";
import { parseOBJ } from "../../../lib/parse-obj";
import { testFrag, testVert } from "../../asset-manager/shader/cannon-renderer";
import { System } from "../../ecs/classes";
import { createFramebuffer } from "../framebuffer";
import Shader from "../shaders";
import { ball } from "./assets";

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
    constructor(scene, context,framebuffer, aspect_ratio, width, height) {
        super(scene);

        this.sphereShape = parseOBJ(ball);

        this.aspect_ratio = aspect_ratio;
        this.width = width;
        this.height = height;
        this.#context = context;
        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);
        console.log("this is aspect_ratio", aspect_ratio);

        this.sphereVAOID = this.#context.createVertexArray();
        this.sphereVBOID = this.#context.createBuffer();

        this.#context.bindVertexArray(this.sphereVAOID);
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.sphereVBOID);

        this.instanceVAOID = this.#context.createBuffer(); 
        //this.#context.bufferData(this.instanceVAOID,, usage)  

        this.#context.bufferData(
            this.#context.ARRAY_BUFFER,
            this.sphereShape.vertices,
            this.#context.STATIC_DRAW
        ) 

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
        this.#context.bindBuffer(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.sphereEBOID
        );
        this.#context.bufferData(
            this.#context.ELEMENT_ARRAY_BUFFER,
            this.sphereShape.indices,
            this.#context.STATIC_DRAW
        );

        this.shader = new Shader(this.#context, testVert, testFrag, [
            "mWorld",
            "mView",
            "mProj",
        ]);

        this.framebuffer =framebuffer 
    }
    init() {
        console.log(
            "systems in scene from cannonPhysics",
            this.scene.systems["CannonPhysicsSystem"]
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

    update(deltaTime) {
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
        this.#context.useProgram(this.shader.getProgram())
        this.#context.bindVertexArray(this.sphereVAOID)
        this.#context.bindBuffer(this.#context.ELEMENT_ARRAY_BUFFER, this.sphereEBOID)
        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = mat4.create()

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
            this.shader.getUniform("mWorld"),
            false,
            identityMatrix
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
        this.#context.drawElements(
            this.#context.LINE_LOOP,
            this.sphereShape.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }
   // update(deltaTime) {
   //     for (const body of this.scene.systems["CannonPhysicsSystem"].world.bodies) {
   //         console.log("body",body)
   //     }
   // }
}
