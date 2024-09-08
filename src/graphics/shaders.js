export const testVert = `#version 300 es
        in vec4 a_position;
        out vec4 v_color;
        void main(void){
            gl_Position = a_position;
            v_color = vec4(1.0,0.0,1.0,1.0);
        }
    `
export const testFrag = `#version 300 es
        precision mediump float;
        in vec4 v_color;
        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            outColor = vec4(1.0,1.0,0.0,1.0);
            outObjectIndex = vec4(0.0,1.0,0.0,1.0);
        }`

