
export default class SGuiButton extends HTMLElement { 
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "button-" + SGuiButton.nextId
        const defaultOptions = {
            label: null,
            customClasses: [],
        }
        this.options = {...defaultOptions,...customOptions}
        const buttonDiv = document.createElement("span");
        buttonDiv.id = `button-${this.id}`;
        this.appendChild(buttonDiv);
        
        this.button = document.createElement("button");
        this.button.classList.add(...this.options.customClasses,"sgui-button")
        this.button.textContent =  this.options.text 
        buttonDiv.appendChild(this.button)
        
        this.button.addEventListener("click", () => {
            // dispacth 
            element.dispatchEvent(new CustomEvent("sgui-button-click", {
                detail: {
                    buttonId: this.buttonId,
                    button: this
                },
                bubbles: true,
                composed: true,
            }))
        });
        SGuiButton.nextId++;
    }
}
