export default class SGuiInputBox extends HTMLElement {
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        const defaultOptions = {
            content: "",
            customClasses: [],
            type:"text"
        }
        this.options = { ...defaultOptions, ...customOptions }
        const inputDiv = document.createElement("div");
        const inputBox = document.createElement("input");
        inputDiv.appendChild(inputBox);
        inputDiv.classList.add(...this.options.customClasses, "sgui-base");
        inputBox.classList.add("sgui-input-box");
        this.appendChild(inputDiv);
        inputBox.value = this.options.content;
        inputBox.type = this.options.type
        this.state = new Proxy({}, {
            set(target, property, value) {
                target[property] = value;
                if (property === "value") {
                    inputBox.value = value
                }
                return true
            }
        }) 

        inputBox.addEventListener("input", (e) => {
            this.state.value = e.target.value;
        });
    }
}
