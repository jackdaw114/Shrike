export default class SGuiButton extends HTMLElement { 
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "button-" + SGuiButton.nextId
        const defaultOptions = {
            label: null,
            customClasses: [],
            icon: null, // SVG path data
            iconSize: 16, // Default icon size
        }
        this.options = {...defaultOptions,...customOptions}
        const buttonDiv = document.createElement("span");
        buttonDiv.id = `button-${this.id}`;
        this.appendChild(buttonDiv);
        
        this.button = document.createElement("button");
        this.button.classList.add(...this.options.customClasses,"sgui-button")
        
        // Add SVG icon if specified
        if (this.options.icon) {
            const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.setAttribute("width", this.options.iconSize);
            svgElement.setAttribute("height", this.options.iconSize);
            svgElement.setAttribute("viewBox", "0 0 24 24");
            svgElement.style.display = "inline-block";
            svgElement.style.verticalAlign = "middle";
            svgElement.style.marginRight = "4px";
            
            const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathElement.setAttribute("d", this.options.icon);
            pathElement.setAttribute("fill", "#000000");
            
            svgElement.appendChild(pathElement);
            this.button.appendChild(svgElement);
        }
        
        this.button.textContent = this.options.text;
        buttonDiv.appendChild(this.button)
        this.appendChild(this.button)          

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
