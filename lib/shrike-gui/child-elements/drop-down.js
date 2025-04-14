export default class SGuiDropDown extends HTMLElement {
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        this.id = "dropDown-" + SGuiDropDown.nextId++;
        this.name = "SGuiDropDown"
        this.isOpen = true
        const defaultOptions = {
            heading: SGuiDropDown.nextId
        }
        this.options = { ...defaultOptions, ...customOptions }

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .sgui-dropdown {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px;
                background-color: #1a222b;
                border-radius: 4px;
                margin: 4px 0;
                border: 1px solid #2a3441;
            }
            .sgui-dropdown-toggle {
                background-color: #212730;
                border: 1px solid #2a3441;
                border-radius: 4px;
                padding: 8px 12px;
                color: #e0e0e0;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 1em;
                user-select: none;
            }
            .sgui-dropdown-toggle:hover {
                background-color: #2a3441;
            }
            .sgui-dropdown-toggle::after {
                content: '▼';
                font-size: 0.8em;
                transition: transform 0.3s ease;
            }
            .sgui-dropdown-toggle[aria-expanded="true"]::after {
                transform: rotate(180deg);
            }
            .sgui-dropdown-content {
                display: flex;
                flex-direction: column;
                gap: 1px;
                padding: 4px;
                background-color: #1a222b;
                border-radius: 4px;
                margin-top: 4px;
            }
            .sgui-dropdown-content[aria-hidden="true"] {
                display: none;
            }
        `;
        this.appendChild(style);
        this.classList.add('sgui-dropdown');

        this.toggleDiv = document.createElement("div");
        this.toggleDiv.classList.add('sgui-dropdown-toggle');
        this.toggleDiv.textContent = this.options.heading;
        this.toggleDiv.setAttribute('aria-expanded', 'true');

        this.contentDiv = document.createElement("div");
        this.contentDiv.classList.add('sgui-dropdown-content');
        this.contentDiv.setAttribute('aria-hidden', 'false');

        this.toggleDiv.addEventListener("click", (e) => {
            this.isOpen = !this.isOpen;
            this.toggleDiv.setAttribute('aria-expanded', this.isOpen);
            this.contentDiv.setAttribute('aria-hidden', !this.isOpen);
        });

        this.appendChild(this.toggleDiv);
        this.appendChild(this.contentDiv);

        this.appendChild = (element) => {
            this.contentDiv.appendChild(element);
        }
    }
}
