import { findFunctionBody } from "../../../lib/util/function-body-parser";
import { Component } from "../classes";

export class Script extends Component {
    constructor(scripts) {
        super();
        if (scripts?.update) {
            this.update = scripts.update;
        }
    }

    update(deltaTime,CANNON, components, scene) {
        console.log("update script not Overridden \nscript attached to entity: -", this.entity.id, "\navailable components are:-", components);
        this.update = () => {};
    }
    fromJSON(json){
        console.log("json",json.update)
        const updateFunctionBody = findFunctionBody(json.update, 'anonymous');
        console.log("updateFunctionBody",updateFunctionBody)
        this.update = new Function('deltaTime','CANNON', 'components', 'scene', 'activeKeys', updateFunctionBody)
        console.log("update",this.update)
    }
} 