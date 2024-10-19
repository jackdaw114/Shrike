import * as sgui_css from "./sgui-css.css?inline";

export default class SGui {
    static defined = false;
    constructor() {
        const rootdiv = document.createElement("div");
        rootdiv.style.zIndex = "9999";
        this.shadowRoot = rootdiv.attachShadow({ mode: "open" });
        document.body.appendChild(rootdiv);
        if (SGui.defined == false) {
            customElements.define("sgui-window", SGuiList);
            SGui.defined = true;
        }
        this.listState = {
            value:0
        }
        this.windowHandle = new SGuiList("testTitle",this.listState,["test","test"]);
        const styles = document.createElement("style");
        styles.textContent = sgui_css.default;
        this.shadowRoot.appendChild(this.windowHandle);
        this.shadowRoot.appendChild(styles);
    }

    createElement() {}
}

class SGuiTray extends HTMLElement {}

export class SGuiWindowBase extends HTMLElement {
    constructor(title) {
        super();
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.title = title
    }
    connectedCallback() {
        this.classList.add("sgui-window");
        const topBar = document.createElement("div");
        topBar.classList.add("top-bar");
        topBar.style.cursor = "grab";

        const title = document.createElement('span')
        title.textContent = this.title

        topBar.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.offsetX = e.clientX - topBar.getBoundingClientRect().left;
            this.offsetY = e.clientY - topBar.getBoundingClientRect().top;

            topBar.style.cursor = "grabbing";
        });

        topBar.addEventListener("mouseup", (e) => {
            this.isDragging = false;
            topBar.style.cursor = "grab";
        });

        document.body.addEventListener("mousemove", (e) => {
            if (this.isDragging === true) {
                this.style.left = e.clientX - this.offsetX + "px";
                this.style.top = e.clientY - this.offsetY + "px";
            }
        });

        const testbutton = document.createElement("button");
        testbutton.classList.add("close-btn");
        topBar.appendChild(title);
        topBar.appendChild(testbutton);
        this.appendChild(topBar);
    }
}

class SGuiList extends SGuiWindowBase {
    constructor(title,listState, listItems) {
        super(title);
        this.listState = listState;
        this.listItems = listItems;
    }
    connectedCallback() {
        super.connectedCallback();
        const ul = document.createElement('ul')
        ul.classList.add('window-list')
        this.listItems.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
        });
        this.appendChild(ul)
        this.addEventListener('click', ()=>{
            this.listState.value = 'clicked'
            console.log(this.listState)
        }) 
    }
}
