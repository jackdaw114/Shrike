export default class SGuiList extends HTMLElement {
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        this.id = "list-" + SGuiList.nextId++;
        this.name = "SGuiList"
        const defaultOptions = {
            content: "",
            customClasses: [],
            type:"text"
        }
        this.options = { ...defaultOptions, ...customOptions }
        this.root = document.createElement("ul");
        this.state = new Proxy({}, {
            set(target, property, value) {
                target[property] = value;
                if (property === "value") {
                }
                return true
            }
        }) 
    }
    appendChild(node){
        const li = document.createElement("li");
        li.appendChild(node)
        super.appendChild(li)
    }
    removeChild(child){
        root.removeChild(child)
    }
}