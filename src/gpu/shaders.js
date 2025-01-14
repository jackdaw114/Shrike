export default class Shader {
    program;
    #context;
    constructor(context, vertexShader, fragmentShader, uniforms) {
        this.#context = context;
        const vertex_shader = this.createShader(
            this.#context.VERTEX_SHADER,
            vertexShader
        );
        const fragment_shader = this.createShader(
            this.#context.FRAGMENT_SHADER,
            fragmentShader
        );
        this.program = this.createProgram(vertex_shader, fragment_shader);
        this.uniforms = {}; // TODO: uniform manager
        if (uniforms)
            this.initUniforms(uniforms);
    }

    initUniforms(uniforms) {
        for (const uniform of uniforms) {
            console.log(uniform);
            this.uniforms[uniform] = this.#context.getUniformLocation(
                this.program,
                uniform
            );
            const error = this.#context.getError();

            if (error !== this.#context.NO_ERROR) {
                let errorMsg;
                switch (error) {
                    case this.#context.INVALID_VALUE:
                        errorMsg = "Invalid program object";
                        break;
                    case this.#context.INVALID_OPERATION:
                        errorMsg = "Program not successfully linked";
                        break;
                    default:
                        errorMsg = `Unknown WebGL error: ${error}`;
                }
                throw new Error(
                    `Failed to get uniform '${uniform}': ${errorMsg}`
                );
            }
            if (this.uniforms[uniform] === null) {
                throw new Error(
                    `Uniform '${uniformName}' not found in shader program. It might be unused and optimized out.`
                );
            }
        }
    }
    use() {
        this.#context.useProgram(this.program) 
    
    }

    getUniform(uniform) {
        return this.uniforms[uniform];
    }

    getProgram() {
        return this.program;
    }
    createProgram(vertexShader, fragmentShader) {
        const program = this.#context.createProgram();
        this.#context.attachShader(program, vertexShader);
        this.#context.attachShader(program, fragmentShader);
        this.#context.linkProgram(program);
        if (
            !this.#context.getProgramParameter(
                program,
                this.#context.LINK_STATUS
            )
        ) {
            console.error("failed to link program");
            this.#context.deleteProgram(program);
            return null;
        }
        this.#context.deleteShader(vertexShader);
        this.#context.deleteShader(fragmentShader);
        return program;
    }

    createShader(type, source) {
        const shader = this.#context.createShader(type);
        this.#context.shaderSource(shader, source);
        this.#context.compileShader(shader);
        if (
            !this.#context.getShaderParameter(
                shader,
                this.#context.COMPILE_STATUS
            )
        ) {
            console.error(
                "Shader compilation failed:",
                this.#context.getShaderInfoLog(shader)
            );
            this.#context.deleteShader(shader);
            return null;
        }
        return shader;
    }
}
