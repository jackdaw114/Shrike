export const testVert = `#version 300 es
precision mediump float;

layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

out vec3 FragPos;
out vec3 Normal;

void main(void) {
    // Transform position to world space
    vec4 worldPosition = mWorld * vec4(a_position, 1.0);
    FragPos = worldPosition.xyz;
    
    // Transform normal to world space
    Normal = normalize(mat3(mWorld) * a_normal);
    
    // Calculate final position
    gl_Position = mProj * mView * worldPosition;
}    
`

export const testFrag = `#version 300 es
precision mediump float;

in vec3 FragPos;
in vec3 Normal;

uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 ambientColor;
uniform float shininess;
uniform vec3 lightPosition;
uniform vec3 viewPos;

layout(location=0) out vec4 outColor;

void main(void) {
    // Normalize vectors
    vec3 normal = normalize(Normal);
    vec3 lightDir = normalize(lightPosition - FragPos);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    // Ambient
    vec3 ambient = ambientColor * diffuseColor;
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;
    
    // Specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;
    
    // Combine components
    vec3 finalColor = ambient + diffuse + specular;
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(0.4545));
    
    outColor = vec4(finalColor, 1.0);
}
`

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
