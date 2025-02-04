
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
        buttonDiv.id = `button-${this.buttonId}`;
        buttonDiv.classList.add(...this.options.customClasses);
        this.appendChild(buttonDiv);
        
        const button = document.createElement("button");
        button.textContent =  this.options.text 
        buttonDiv.appendChild(button)
        
        button.addEventListener("click", () => {
            // dispacth 
            element.dispatchEvent(new CustomEvent("sgui-button-click", {
                detail: { buttonId: this.buttonId },
                bubbles: true,
                composed: true,
            }))
        });
        SGuiButton.nextId++;
    }
}
