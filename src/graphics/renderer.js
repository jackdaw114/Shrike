export default class Renderer{
    #context
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas){
        this.#context = canvas.getContext("webgl")
        if (!this.#context) {
            console.error("Web Gl Not Supported")
        }
    }
    
    test() {
            
    }

    async loadShaderFile(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load shader: ${response.statusText}`);
      }
      return await response.text();
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

    
