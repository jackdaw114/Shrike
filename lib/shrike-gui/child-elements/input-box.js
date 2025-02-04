export default class SGuiInputBox extends HTMLElement {
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        const defaultOptions = {
            content: "",
            customClasses: [],
        }
        this.options = { ...defaultOptions, ...customOptions }
        const inputDiv = document.createElement("div");
        const inputBox = document.createElement("input");
        inputDiv.appendChild(inputBox);
        inputDiv.classList.add(...this.options.customClasses, "sgui-base");
        inputBox.classList.add("sgui-input-box");
        this.appendChild(inputDiv);
        inputBox.value = this.content.value;

        inputBox.addEventListener("input", (e) => {
            this.content.value = e.target.value;
            if (this.content.value) {
                inputBox.value = this.content.value;
                // console.log(inputBox.value);
            }
        });
    }
}
