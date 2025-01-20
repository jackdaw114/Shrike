export const testVert = `#version 300 es
        precision mediump float;

        layout(location=0)in vec3 a_position;
        layout(location=1)in vec3 a_normal;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        uniform vec3 lightPosition;

        void main(void){
            
            vec4 worldPosition = mWorld * vec4(a_position, 1.0);
            vec4 mvPosition = mView * worldPosition;
            gl_Position = mProj * mvPosition;

        }
    `;
export const testFrag = `#version 300 es
        precision mediump float;

        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){
            outColor = vec4(0.40,1.0,0.40, 1.0);
        }`;
