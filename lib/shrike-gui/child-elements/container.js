export default class SGuiContainer extends HTMLElement{
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        this.id = "container-" + SGuiContainer.nextId++;
        this.name = "SGuiContainer"
        const defaultOptions = {
            heading:"heading container" + SGuiContainer.nextId
        }
        this.options = {...defaultOptions,...customOptions}
        this.textContent = this.options.heading
    }
}
