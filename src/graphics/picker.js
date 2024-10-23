import {glMatrix, mat4} from "gl-matrix";
import { pickerFrag, pickerVert } from "../assent-manager/shader-assets";
import { System } from "../ecs/classes";
import Shader, { testFrag, testVert } from "./shaders";

export default class PickingSystem extends System {
    /**
     * @type {WebGL2RenderingContext}
     */
    #context;

    constructor(scene, width, height, context) {
        super(scene);
        this.aspect_ratio = width/height
        this.width = width;
        this.height = height
        this.#context = context;
        this.shader = new Shader(context,pickerVert,pickerFrag)
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
        const ext = this.#context.getExtension("EXT_color_buffer_float");
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

    init() {
    }
    


    update(deltaTime) {
        // octree culling here then provide updated array to the loop below

        this.#context.useProgram(this.shader.getProgram())
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            this.pickerFramebuffer
        );
        this.#context.bindTexture(this.#context.TEXTURE_2D, this.pickerTexture);
        this.#context.disable(this.#context.BLEND)
            
        this.#context.clear(this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT)

        for (const component of this.scene.componentMaps["Geometry"]) {
            this.render(component);
        }
        this.#context.bindFramebuffer(
            this.#context.FRAMEBUFFER,
            null
        );
        this.#context.bindTexture(this.#context.TEXTURE_2D, null);
        this.#context.enable(this.#context.BLEND)

    }
    
    readColor(x, y) {
        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, this.pickerFramebuffer)
        this.#context.readBuffer(this.#context.COLOR_ATTACHMENT0)
        this.#context.bindTexture(this.#context.TEXTURE_2D, this.pickerTexture);
        
        let pixels = new Float32Array(4)
        this.#context.readPixels(x, y, 1, 1, this.#context.RGBA, this.#context.FLOAT, pixels)

        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, null)
        this.#context.bindTexture(this.#context.TEXTURE_2D, null);
        this.#context.readBuffer(this.#context.BACK)
        return pixels
    }

    render(component) {
        this.#context.bindVertexArray(component.vaoID);

        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, component.vboID);
        this.#context.bufferSubData(
            this.#context.ARRAY_BUFFER,
            0,
            component.vertices
        );



        this.#context.enableVertexAttribArray(0);
        this.#context.enableVertexAttribArray(1);
        

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
            
        const idLocation = this.#context.getUniformLocation(this.shader.getProgram(), "id")

        let identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        let worldMatrix = component.entity.transformation.getMatrix();
        let viewMatrix = this.scene.getCamera();
        let projMatrix = new Float32Array(16);

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(45),
            this.aspect_ratio, // get from camera
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
        this.#context.uniform1f(idLocation, 3)

        this.#context.drawElements(
            this.#context.TRIANGLES,
            component.indices.length,
            this.#context.UNSIGNED_SHORT,
            0
        );
    }

    renderPlugin(){
    }
}
