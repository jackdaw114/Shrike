import SGui from "../../lib/shrike-gui/sgui";
import { System } from "../ecs/classes";
import { GuiComponent } from "../ecs/component-classes";

export default class Gui extends System {
    constructor() {
        super();
        this.sguiInstance = new SGui();
    }
    update(deltaTime) {} //override??
    init() {
        for (let guiComponent in this.components["GuiComponent"]) {
            this.initGui(guiComponent);
        }
    }
    /**
     * @param {GuiComponent} guiComponent
     */
    initGui(guiComponent) {
        guiComponent.handle = this.sguiInstance.SGuiCustom(guiComponent.title,true);
        if (!guiComponent.open) {
            guiComponent.handle.close()
        }
    }

    addComponent() {}
}
