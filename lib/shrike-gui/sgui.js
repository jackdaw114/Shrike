import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

/*
    * Things that can be improved on:
    * batching system for events 
    */

export default class SGui {
    static defined = false;
    constructor() {
        const rootdiv = document.createElement("div");
        rootdiv.style.zIndex = "9999";
        this.shadowRoot = rootdiv.attachShadow({ mode: "open" });
        document.body.appendChild(rootdiv);
        if (SGui.defined == false) {
            customElements.define("sgui-window", SGuiList);
            customElements.define("sgui-color-picker", SGuiColorPicker);
            SGui.defined = true;
        }
        const styles = document.createElement("style");
        styles.textContent = sgui_css.default;
        this.shadowRoot.appendChild(styles);
    }

    SGuiList(title,listState,listItems) {
        const sguiList = new SGuiList(title,listState,listItems) // this is the window handle ig
        this.shadowRoot.appendChild(sguiList)
    }
    SGuiColorPicker(title,colorState) {
        const sguiColorPicker = new SGuiColorPicker(title,colorState)
        this.shadowRoot.appendChild(sguiColorPicker)
    }
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
    
    onClose(func) {
          
    }
}

class SGuiColorPicker extends SGuiWindowBase{
    constructor(title, colorState) {
        super(title);
        this.colorState = colorState
    }
    connectedCallback() {
        super.connectedCallback()
        const pickerDiv = document.createElement('div')
        pickerDiv.id='picker'
        pickerDiv.classList.add('sgui-color-picker','sgui-base')
        this.appendChild(pickerDiv)
        const colorPicker = new iro.ColorPicker(pickerDiv, {
            width: 300,
            padding: 10,

        })
        colorPicker.on('color:change', (color) => {
            this.colorState = color.rgb
        })

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
