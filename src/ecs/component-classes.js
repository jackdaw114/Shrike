import { mat4, vec3 } from "gl-matrix";
import { Component, Transformation } from "./classes";
import {Material} from "../material/material";

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
        this.render = true;
        this.depthTest = true;
        this.material = new Material(new Float32Array([0.6,0.6,0.6]),new Float32Array([0.2,0.2,0.2]) , new Float32Array([0.9,0.9,0.9]), 99);
    }
    materialOptions(params) {
        const {diffuseColor=new Float32Array([1.0,1.0,1.0]), ambientColor=new Float32Array([1.0,1.0,1.0]), specularColor=new Float32Array([1.0,1.0,1.0]), shininess = 0.} = params;
        this.material = new Material(diffuseColor,ambientColor,specularColor,shininess)
    }
}


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

export class DebugLine extends Component{
    constructor() {
        super();
        this.arrayBuffer = [];
    }

    addLine(from, to) {
        this.arrayBuffer = new Float32Array([...this.arrayBuffer,...from,...to])
    }
}

export class Picker extends Component{
    constructor() {
        super();
    }

}

export class Script extends Component{
    constructor() {
        super();
    }

    update(deltaTime,components) {
        console.log("update script not Overridden \nscript attached to entity: -",this.entity.id,"\navailable components are:-",components)
        
        this.update = () => {}
        
        //to override
    }
}
