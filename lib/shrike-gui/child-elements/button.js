export default class SGuiButton extends HTMLElement { 
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "button-" + SGuiButton.nextId
        const defaultOptions = {
            label: null,
            customClasses: [],
            icon: null, // SVG icon path or markup
            iconPosition: 'left', // 'left' or 'right'
        }
        this.options = {...defaultOptions,...customOptions}
        const buttonDiv = document.createElement("span");
        buttonDiv.id = `button-${this.id}`;
        this.appendChild(buttonDiv);
        
        this.button = document.createElement("button");
        this.button.classList.add(...this.options.customClasses,"sgui-button")
        
        // Create icon container if icon is provided
        if (this.options.icon) {
            const iconContainer = document.createElement("span");
            iconContainer.classList.add("sgui-button-icon");
            
            // Check if icon is a path or markup
            if (this.options.icon.startsWith("<svg")) {
                iconContainer.innerHTML = this.options.icon;
            } else {
                // Assume it's a path to an SVG file
                const img = document.createElement("img");
                img.src = this.options.icon;
                img.alt = "";
                iconContainer.appendChild(img);
            }
            
            // Add icon to button based on position
            if (this.options.iconPosition === 'left') {
                this.button.appendChild(iconContainer);
            }
        }
        
        
        // Add icon to the right if specified
        if (this.options.icon && this.options.iconPosition === 'right') {
            this.button.appendChild(iconContainer);
        }
        
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
