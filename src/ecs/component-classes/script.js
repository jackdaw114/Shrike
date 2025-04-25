import { findFunctionBody } from "../../../lib/util/function-body-parser";
import { Component } from "../classes";

export class Script extends Component {
    constructor(scripts) {
        super();
        if (scripts?.update) {
            this.update = scripts.update;
        }
        if (scripts?.init){
            this.init = scripts.init;
        }
    }

    update(deltaTime,CANNON, components, scene) {
        console.log("update script not Overridden \nscript attached to entity: -", this.entity.id, "\navailable components are:-", components);
        this.update = () => {};
    }
    init(CANNON, components, scene) {
    }
    fromJSON(json){
        if (json.update){
            const updateFunctionBody = findFunctionBody(json.update, 'anonymous');
            this.update = new Function('deltaTime','CANNON', 'components', 'scene', 'activeKeys', updateFunctionBody)
        }
        if(json.init){
            const initFunctionBody = findFunctionBody(json.init,'anonymous');
            this.init = new Function('CANNON','components','scene',initFunctionBody)
        }
    }
} 