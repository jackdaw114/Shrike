export default class SGuiContainer extends HTMLElement{
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        const defaultOptions = {
            heading:"heading container" + SGuiContainer.nextId

        }
        this.options = {...defaultOptions,...customOptions}

        this.textContent = this.options.heading

        this.id = "container-" + SGuiContainer.nextId
         
        SGuiContainer.nextId++
    }
}
