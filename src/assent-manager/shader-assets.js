
export const testVert = `#version 300 es
        precision mediump float;

        in vec3 a_position;
        in vec3 a_color;

        out vec3 v_color;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;


        void main(void){
            gl_Position = mProj * mView * mWorld * vec4(a_position,1.0);
            v_color = a_color;
        }
    `
export const testFrag = `#version 300 es
        precision mediump float;
        in vec3 v_color;
        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            vec4 temp = vec4(v_color,1.);
            outColor = vec4(1.0,0.0,0.,1.0);
        }`

export const pickerVert =`#version 300 es
        precision mediump float;
        
        uniform float id;

        layout(location=0) in vec3 a_position;
        out vec3 v_color;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;


        void main(void){
            gl_Position = mProj * mView * mWorld * vec4(a_position,1.0);
            v_color = vec3(id,id,id);
        }
    `

export const pickerFrag =`#version 300 es
        precision mediump float;
        in vec3 v_color;
        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            outColor = vec4(v_color,1.0);
        }`