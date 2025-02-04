export default class Light {
    constructor(type,position) {
        this.type = type;
        this.position = new Float32Array(position);
    }
}
