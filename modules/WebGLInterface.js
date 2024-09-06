export class WebGlTest{
    #context
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas){
        this.canvas = canvas
        this.#context = canvas.getContext("webgl2")
        if(!this.#context){
            console.error("webgl not supported")
        }
    }
    
    initTest(){
        const vertexShader = this.createShader(this.#context.VERTEX_SHADER,this.#vertexShader)
        const fragmentShader = this.createShader(this.#context.FRAGMENT_SHADER,this.#fragmentShader)
        const program = this.createProgram(vertexShader,fragmentShader)
        this.#context.useProgram(program)
   
        // Define the triangle vertices
        const vertices = new Float32Array([
            0.0,  0.5,  // Vertex 1 (x, y)
           -0.5, -0.5,  // Vertex 2 (x, y)
            0.5, -0.5   // Vertex 3 (x, y)
        ]);
        const buffer = this.#context.createBuffer();
        this.#context.bindBuffer(this.#context.ARRAY_BUFFER,buffer)
        this.#context.bufferData(this.#context.ARRAY_BUFFER,vertices,this.#context.STATIC_DRAW)

        const positionLocation = this.#context.getAttribLocation(program,'a_position');
         
        this.#context.enableVertexAttribArray(positionLocation)
        this.#context.vertexAttribPointer(positionLocation,2,this.#context.FLOAT,false,0,0)


        const colorTexture = this.#context.createTexture();
        this.#context.bindTexture(this.#context.TEXTURE_2D, colorTexture);
        this.#context.texImage2D(this.#context.TEXTURE_2D, 0, this.#context.RGBA, this.canvas.width, this.canvas.height, 0, this.#context.RGBA, this.#context.UNSIGNED_BYTE, null);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MIN_FILTER, this.#context.NEAREST);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MAG_FILTER, this.#context.NEAREST);

        const objectIdTexture = this.#context.createTexture();
        this.#context.bindTexture(this.#context.TEXTURE_2D, objectIdTexture);
        this.#context.texImage2D(this.#context.TEXTURE_2D, 0, this.#context.RGBA, this.canvas.width, this.canvas.height, 0, this.#context.RGBA, this.#context.UNSIGNED_BYTE, null);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MIN_FILTER, this.#context.NEAREST);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MAG_FILTER, this.#context.NEAREST);

        // Create a framebuffer and attach the textures
        const framebuffer = this.#context.createFramebuffer();
        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, framebuffer);
        this.#context.framebufferTexture2D(this.#context.FRAMEBUFFER, this.#context.COLOR_ATTACHMENT0, this.#context.TEXTURE_2D, colorTexture, 0);
        this.#context.framebufferTexture2D(this.#context.FRAMEBUFFER, this.#context.COLOR_ATTACHMENT1, this.#context.TEXTURE_2D, objectIdTexture, 0);

        
        this.#context.drawBuffers([this.#context.COLOR_ATTACHMENT0,this.#context.COLOR_ATTACHMENT1])
        if(this.#context.checkFramebufferStatus(this.#context.FRAMEBUFFER)!= this.#context.FRAMEBUFFER_COMPLETE){
            console.log("frame buffer not complete")
        }
        
        //this.#context.activeTexture(this.#context.TEXTURE0)
        //this.#context.bindTexture(this.#context.TEXTURE_2D,objectIdTexture)

        
    

        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER,null)
        this.#context.clearColor(0.0,0.0,0.0,1.0)
        this.#context.clear(this.#context.COLOR_BUFFER_BIT)
        this.#context.drawArrays(this.#context.TRIANGLES,0,3)
        const x = 200
        const y = 200
        const pixelData = new Uint8Array(4)
        this.#context.readBuffer(this.#context.COLOR_ATTACHMENT1)
        this.#context.readPixels(x,y,1,1,this.#context.RGBA,this.#context.UNSIGNED_BYTE,pixelData)
        console.log(pixelData)
    }


    #vertexShader=`#version 300 es
        in vec4 a_position;
        out vec4 v_color;
        void main(void){
            gl_Position = a_position;
            v_color = vec4(1.0,0.0,1.0,1.0);
        }
    `
    #fragmentShader=`#version 300 es
        precision mediump float;
        in vec4 v_color;
        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            outColor = vec4(1.0,1.0,0.0,1.0);
            outObjectIndex = vec4(0.0,1.0,0.0,1.0);
        }
    `
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
