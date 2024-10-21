import { mat4 } from "gl-matrix";
import { Component, Transformation } from "./classes";
import {SGuiWindowBase} from "../../lib/shrike-gui/sgui";

export class Geometry extends Component {
    /**
     * @param {Float32Array} vertices
     * @param {Uint16Array} indices
     * @param {Transformation} transformation
     */
    constructor(vertices, indices) {
        super();
        this.vertices = vertices;
        this.indices = indices;
        this.texture = 0;
    }
}

export class GuiComponent extends Component {
    /**
     * @param {Boolean} open
     */
    constructor(title,controller, isOpen) {
        super();
        this.controller = controller;
        /**
            * @type {SGuiWindowBase}

            */
        this.handle;
        this.isOpen = isOpen;
        this.title = title
    }
}

export class DebugLine extends Component{
    constructor(data) {
        super();
        this.arrayBuffer = new Float32Array(data);
    }


}
