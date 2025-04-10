import { Component } from "../classes";

export class DebugLine extends Component {
    constructor() {
        super();
        this.arrayBuffer = [];
    }

    addLine(from, to) {
        this.arrayBuffer = new Float32Array([...this.arrayBuffer, ...from, ...to]);
    }
} 