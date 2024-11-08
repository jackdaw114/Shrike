export class Material {
    constructor(diffuseColor,ambientColor,specularColor,shininess) {
        this.diffuseColor = diffuseColor;
        this.ambientColor = ambientColor;
        this.specularColor = specularColor;
        this.shininess = shininess
    }
    getDiffuse() {
        return this.diffuseColor
    }
    getSpecular() {
        return this.specularColor
    }
    getAmbient() {
        return this.ambientColor
    }
    getShininess() {
        return this.shininess
    }
}
