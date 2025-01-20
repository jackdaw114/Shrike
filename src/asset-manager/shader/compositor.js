export const compositorVertexShader = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}`;

// Fragment Shader
export const compositorFragmentShader = `#version 300 es
precision mediump float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSampler;

void main() {
    vec4 texColor = texture(uSampler, vTexCoord);
    if (texColor.a == 0.){
        discard;
    }
    fragColor = texColor;
}`;
