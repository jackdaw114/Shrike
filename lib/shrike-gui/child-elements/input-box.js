export default class SGuiInputBox extends HTMLElement {
    static nextId = 0
    constructor( customOptions = {}) {
        super();
        const defaultOptions = {
            content: "",
            customClasses: [],
            type:"text",
            heading: "this.inputBox"+SGuiInputBox.nextId,
            step:1
        }
        this.options = { ...defaultOptions, ...customOptions }
        console.log(this.options)
        const inputDiv = document.createElement("div");
        this.inputBox = document.createElement("input");
        const inputSpan = document.createElement("span");
        inputDiv.style.display = "flex"
        inputDiv.style.justifyContent = "space-between"
        inputSpan.style.userSelect = "none"
        inputDiv.append(inputSpan,this.inputBox);
        inputSpan.textContent = this.options.heading
        inputDiv.classList.add(...this.options.customClasses, "sgui-base");
        this.inputBox.classList.add("sgui-input-box");
        this.appendChild(inputDiv);
        this.inputBox.value = this.options.content;
        this.inputBox.type = this.options.type
        this.inputBox.step = this.options.step
        const inputBox = this.inputBox
        this.state = new Proxy({value:this.options.content}, {
            set(target, property, value) {
                target[property] = parseFloat(value);
                if (property === "value") {
                    console.log("changing value to ",value)
                    inputBox.value = parseFloat(value)
                }
                return true
            }
        }) 

        this.inputBox.addEventListener("input", (e) => {
            this.state.value = parseFloat(e.target.value);
        });
        SGuiInputBox.nextId++
    }
    setValue(value) {
        this.state.value = value;
    }
    getValue() {
        return this.state.value;
    }
}