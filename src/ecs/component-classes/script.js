import { Component } from "../classes";

export class Script extends Component {
    constructor(scripts) {
        super();
        if (scripts.update) {
            this.update = scripts.update;
        }
    }

    update(deltaTime, components, scene) {
        console.log("update script not Overridden \nscript attached to entity: -", this.entity.id, "\navailable components are:-", components);
        this.update = () => {};
    }
} 