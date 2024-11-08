import {Component} from "./classes";

export class PickerGeometry extends Component{
    constructor(vertices,indices) {
        super();
        this.vertices = vertices;
        this.indices = indices;
        this.texture = 0;
        this.render = true;
        this.depthTest = true;
    }
}
