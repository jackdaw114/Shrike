import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

/*
 * Things that can be improved on:
 * batching system for events
 */



export default class SGui {
    static defined = false;
    constructor() {

        // init
        this.windowId = 0;
        this.windowList = [];

        const rootdiv = document.createElement("div");
        rootdiv.style.zIndex = "9999";
        this.shadowRoot = rootdiv.attachShadow({ mode: "open" });
        document.body.appendChild(rootdiv);
        if (SGui.defined == false) {
            customElements.define("sgui-file-panel", SGuiFilePanel);
            customElements.define("sgui-input", SGuiInputBox);
            customElements.define("sgui-color-picker", SGuiColorPicker);
            customElements.define("sgui-window", SGuiWindowBase);
            SGui.defined = true;
        }
        const styles = document.createElement("style");
        styles.textContent = sgui_css.default;
        this.shadowRoot.appendChild(styles);
    }



    createWindow(title, isOpen) {
        const sguiWindow = new SGuiWindowBase(this.windowId,title, isOpen, this.windowList.length?(this.windowList[this.windowList.length - 1].getBoundingClientRect().right):0);
        this.windowList.push(sguiWindow);
        this.windowId
        this.shadowRoot.appendChild(sguiWindow);
        return sguiWindow;
    }
}

class SGuiTray extends HTMLElement { }

export class SGuiWindowBase extends HTMLElement {
    constructor(windowId, title, isOpen, left=0, top=0) {
        super();
        this.windowId = windowId;
        this.isDragging = false;
        this.style.top = top + "px";
        this.style.left = left + "px";
        
        this.offsetX = 0;
        this.offsetY = 0;
        this.title = title;
        this.isOpen = isOpen
    }
    connectedCallback() {
        this.classList.add("sgui-window");
        const topBar = document.createElement("div");
        topBar.classList.add("top-bar");
        topBar.style.cursor = "grab";

        const title = document.createElement("span");
        title.textContent = this.title;

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
    appendColorPicker(controller) {

        let colorPicker = new SGuiColorPicker(controller)
        this.appendChild(colorPicker)
        return colorPicker
    }

    appendInputBox(controller) {
        let inputBox = new SGuiInputBox(controller)
        this.appendChild(inputBox)
        return inputBox
    }

    appendFilePanel(controller) {
        let filePanel = new SGuiFilePanel(controller)
        this.appendChild(filePanel)
        return filePanel
    }

    close() {
        this.style.display = "none"
        this.isOpen = false
    }
    open() {
        this.style.display = "block"
        this.isOpen = true
    }
}

class SGuiColorPicker extends HTMLElement {
    constructor(colorState) {
        super();
        this.colorState = colorState;

    }
    connectedCallback() {
        const pickerDiv = document.createElement("div");
        pickerDiv.id = "picker";
        pickerDiv.classList.add("sgui-color-picker", "sgui-base");
        this.appendChild(pickerDiv);
        const colorPicker = new iro.ColorPicker(pickerDiv, {
            width: 300,
            padding: 10,
        });
        colorPicker.on("color:change", (color) => {
            this.colorState.r = color.rgb.r;
            this.colorState.g = color.rgb.g;
            this.colorState.b = color.rgb.b;

        });
    }
}

class SGuiInputBox extends HTMLElement {
    constructor(content) {
        super();
        this.content = content;
    }

    connectedCallback() {
        const inputDiv = document.createElement("div");
        const inputBox = document.createElement("input");
        inputDiv.appendChild(inputBox);
        inputDiv.classList.add("sgui-base");
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

// File Panel
class SGuiFilePanel extends HTMLElement {
    constructor(controller) {
        super();
        this.controller = controller;
    }

    connectedCallback() {
        const filePanel = document.createElement("div");
        const fileList = document.createElement("ul");
        const heading = document.createElement("div");
        filePanel.appendChild(heading)
        
        fileList.classList.add("sgui-file-list");
        filePanel.classList.add("sgui-file-panel", "sgui-base", "drop-zone", "file-placeholder");

        const placeholder = document.createElement("div");
        placeholder.textContent = "Wow, such empty.";
        placeholder.classList.add("file-placeholder");
        filePanel.appendChild(placeholder);

        // Function to update placeholder visibility
        const updatePlaceholder = () => {
            if (this.controller.files.length === 0) {
                placeholder.style.display = "block";
            } else {
                placeholder.style.display = "none";
                heading.textContent="Files"
            }
        };

        filePanel.addEventListener("drop", (ev) => {
            console.log("File(s) dropped");
            ev.preventDefault(); // Prevent file from being opened


            const files = ev.dataTransfer.items
                ? [...ev.dataTransfer.items]
                      .filter((item) => item.kind === "file")
                      .map((item) => item.getAsFile())
                : [...ev.dataTransfer.files];

            files.forEach((file, i) => {
                this.controller.files.push(file); // Add file to the controller

                const fileElement = document.createElement("li");
                fileElement.textContent = file.name;
                // TODO: Add an event listener to set context to a clicked li element
                fileElement.addEventListener("click", () => {
                    // TODO: set context to the index/id of the clicked li element
                    this.controller.currentContext = file
                })
                fileList.appendChild(fileElement);

                console.log(`… file[${i}].name = ${file.name}`);
            });

            updatePlaceholder(); // Hide placeholder after adding files
        });

        filePanel.addEventListener("dragover", (ev) => {
            console.log("File(s) in drop zone");
            placeholder.textContent = "Drop ze bomb"
            ev.preventDefault(); // Prevent default to allow drop
        });

        filePanel.addEventListener("dragleave", (ev) => {
            placeholder.textContent = "Wow, such empty.";
            ev.preventDefault(); // Prevent default to allow drop
        });


        filePanel.appendChild(fileList);
        this.appendChild(filePanel);

        // Initially update the placeholder based on existing files
        updatePlaceholder();
    }
}


