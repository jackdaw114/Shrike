export default class SGuiTopRibbon extends HTMLElement {
    static nextId = 0;
    constructor() {
        super();
        this.id = "topRibbon-" + SGuiTopRibbon.nextId++;
        this.name = "SGuiTopRibbon"
    }
}