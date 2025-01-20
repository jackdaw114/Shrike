
export const testVert = `#version 300 es
        precision mediump float;

        layout(location=0)in vec3 a_position;
        layout(location=1)in vec3 a_normal;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        uniform vec3 lightPosition;

        out vec3 vNormal;
        out vec3 vViewPosition;
        out vec3 vWorldPosition;
        out vec3 vLightPosition;

        void main(void){
            
            vec4 worldPosition = mWorld * vec4(a_position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            vec4 mvPosition = mView * worldPosition;
            vViewPosition = -mvPosition.xyz;
            
            vNormal = mat3(mWorld) * a_normal;
            vLightPosition = normalize(mat3(mView) * lightPosition);

            gl_Position = mProj * mvPosition;

        }
    `
export const testFrag = `#version 300 es
        precision mediump float;

        in vec3 vNormal;
        in vec3 vWorldPosition;
        in vec3 vViewPosition;
        in vec3 vLightPosition;

        uniform vec3 diffuseColor;
        uniform vec3 specularColor;
        uniform vec3 ambientColor;
        uniform float shininess;

        layout(location=0) out vec4 outColor;
        layout(location=1) out vec4 outObjectIndex;
        void main(void){

            vec3 N = normalize(vNormal);
            vec3 L = vLightPosition;
            vec3 V = normalize(vViewPosition);
            vec3 H = normalize(L + V);
            
            // Ambient
            vec3 ambient = ambientColor;
            
            // Diffuse
            float NdotL = max(dot(N, L), 0.10);
            vec3 diffuse = NdotL * diffuseColor;
            
            vec3 reflectDir = reflect(-L, N);
            float specularIntensity = pow(max(dot(V, reflectDir), 0.0), shininess);
            //float specularIntensity = pow(NdotH, shininess);
            vec3 specular = specularIntensity * specularColor ;
            
            // Final color
            vec3 finalColor = ambient + diffuse + specular;
             
            // Gamma correction
            finalColor = pow(finalColor, vec3(1.0/2.2));
            
            outColor = vec4(finalColor, 1.0);

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
