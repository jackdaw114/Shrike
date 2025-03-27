export const testVert = `#version 300 es
precision mediump float;

layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec3 lightPosition;

out vec3 vNormal;
out vec3 vViewPosition;
out vec3 vWorldPosition;
out vec3 vLightDirection;

void main(void) {
    // Transform position to world space
    vec4 worldPosition = mWorld * vec4(a_position, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Transform to view space for lighting calculations
    vec4 viewPosition = mView * worldPosition;
    vViewPosition = viewPosition.xyz;
 
    // Transform normal to world space for lighting
    vNormal = normalize(mat3(mWorld) * a_normal);

    // Calculate light direction in view space
    vec4 lightViewPosition = mView * vec4(lightPosition, 1.0);
    vLightDirection = normalize(lightViewPosition.xyz - viewPosition.xyz);
 
    gl_Position = mProj * viewPosition;
}    
`
export const testFrag = `#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vWorldPosition;
in vec3 vViewPosition;
in vec3 vLightDirection;

uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 ambientColor;
uniform float shininess;

layout(location=0) out vec4 outColor;

void main(void) {
    // Normalize vectors for lighting calculations
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLightDirection);
    vec3 V = normalize(-vViewPosition);
    vec3 H = normalize(L + V);
    
    // Calculate lighting components
    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    
    // Ambient with improved intensity
    vec3 ambient = ambientColor * (0.5 + 0.5 * NdotL) * diffuseColor;
    
    // Diffuse with improved falloff
    vec3 diffuse = NdotL * diffuseColor;
    
    // Specular with improved falloff and fresnel-like effect
    float specularIntensity = pow(NdotH, shininess) * (1.0 - NdotL * 0.5);
    vec3 specular = specularIntensity * specularColor;
    
    // Combine components with improved balance
    vec3 finalColor = ambient + diffuse + specular;
    
    // Gamma correction for better visual quality
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
