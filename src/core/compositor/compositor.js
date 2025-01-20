import {compositorFragmentShader, compositorVertexShader} from "../../asset-manager/shader/compositor";
import {createFramebuffer} from "../../gpu/framebuffer";
import Shader from "../../gpu/shaders";

export class Compositor{
    /**
     * @type {WebGL2RenderingContext}
     */
    #context;
    POS_SIZE = 2;
    POS_OFFSET = 0;
    UV_SIZE = 2;
    UV_OFFSET = this.POS_SIZE * Float32Array.BYTES_PER_ELEMENT;
    VERTEX_SIZE = this.POS_SIZE + this.UV_SIZE
    VERTEX_SIZE_IN_BYTES = this.VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT
    /**
     * @param {WebGL2RenderingContext} canvas
     */
    constructor(context, aspect_ratio, width, height) {
        this.framebuffers=[]
        this.#context = context
        this.width = width
        this.height = height
        this.shader = new Shader(this.#context, compositorVertexShader, compositorFragmentShader, [
           "uSampler" 
        ])
        

        const vertexArray = new Float32Array([
            // Positions (xy)    // Texture coords (uv)
            -1, -1,             0, 0,    // Bottom left
             1, -1,             1, 0,    // Bottom right
            -1,  1,             0, 1,    // Top left
            -1,  1,             0, 1,    // Top left
             1, -1,             1, 0,    // Bottom right
             1,  1,             1, 1     // Top right
        ]);
        this.vaoID = this.#context.createVertexArray();
        this.vboID = this.#context.createBuffer();
        this.#context.bindVertexArray(this.vaoID)
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.vboID)
        this.#context.bufferData(this.#context.ARRAY_BUFFER, vertexArray,this.#context.STATIC_DRAW)

        this.#context.vertexAttribPointer(0, this.POS_SIZE, this.#context.FLOAT, false, this.VERTEX_SIZE_IN_BYTES, this.POS_OFFSET)
        this.#context.vertexAttribPointer(1,this.UV_SIZE, this.#context.FLOAT, false, this.VERTEX_SIZE_IN_BYTES, this.UV_OFFSET)


        this.#context.enableVertexAttribArray(0);
        this.#context.enableVertexAttribArray(1);
    }
    addFramebuffer(framebuffer,compositionOptions) {
       this.framebuffers.push({
           framebuffer: framebuffer,
           ...compositionOptions
       }) 
    }

    

    render() {
        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER,null)
        this.#context.clear(this.#context.COLOR_BUFFER_BIT) 
        this.#context.useProgram(this.shader.getProgram())
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER, this.vboID)
        this.#context.bindVertexArray(this.vaoID)
        this.#context.enableVertexAttribArray(0);
        this.#context.enableVertexAttribArray(1);
        this.#context.uniform1i(this.shader.getUniform("uSampler"),0)
        for (const framebuffer of this.framebuffers){
            this.#context.activeTexture(this.#context.TEXTURE0)
            this.#context.bindTexture(this.#context.TEXTURE_2D, framebuffer.framebuffer.texture)
            this.#context.drawArrays(this.#context.TRIANGLES, 0, 6)
        }
    }
}


// Stuff to figure out
// -- framebuffer resolution
//-- framebuffer format
// -- texture format
// -- depth info calculation ???

// stuff to consider
//  -- High Dpi consideration for texture size

// Stuff to add
//
