import { mat4, vec3 } from "gl-matrix";
import { Component, Transformation } from "./classes";
import {Material} from "../material/material";
import { DebugLine } from "./component-classes/debug-line";
import { Geometry } from "./component-classes/geometry";
import { Script } from "./component-classes/script";
import { PhysicsBody } from "./component-classes/physics-body";


export class GuiComponent extends Component {
    /**
     * @param {Boolean} open
     */
    constructor(title,controller, isOpen) {
        super();
        this.controller = controller;
        this.handle;
        this.isOpen = isOpen;
        this.title = title
    }
}


export class Picker extends Component{
    constructor() {
        super();
    }

}


export {
    Component,
    DebugLine,
    Geometry,
    Script,
    PhysicsBody
};
