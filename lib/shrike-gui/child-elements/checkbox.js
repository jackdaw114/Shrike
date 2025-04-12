export default class SGuiCheckbox extends HTMLElement {
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        this.id = "checkbox-" + SGuiCheckbox.nextId++;
        this.name = "SGuiCheckbox"
        const defaultOptions = {
            heading: "Checkbox",
            checked: false,
            customClasses: []
        };
        this.options = { ...defaultOptions, ...customOptions };

        // Create container
        const container = document.createElement("div");
        container.classList.add("sgui-checkbox-container");
        
        // Create label
        const label = document.createElement("label");
        label.textContent = this.options.heading;
        label.classList.add("sgui-checkbox-label");
        
        // Create checkbox input
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.checked = this.options.checked;
        this.checkbox.classList.add("sgui-checkbox");
        
        // Add event listener
        this.checkbox.addEventListener("change", () => {
            this.dispatchEvent(new CustomEvent("checkbox-change", {
                detail: {
                    checked: this.checkbox.checked
                },
                bubbles: true,
                composed: true
            }));
        });

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .sgui-checkbox-container {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px;
                background-color: #212730;
                border-radius: 4px;
            }
            .sgui-checkbox-label {
                color: #fff;
                font-size: 0.9em;
                user-select: none;
            }
            .sgui-checkbox {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
        `;
        
        container.appendChild(style);
        container.appendChild(this.checkbox);
        container.appendChild(label);
        this.appendChild(container);
    }

    setChecked(checked) {
        this.checkbox.checked = checked;
    }

    getChecked() {
        return this.checkbox.checked;
    }
} 