import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

/*
 * Things that can be improved on:
 * batching system for events
 */



export default class SGui {
    static defined = false;

    constructor() {
        this.windowId = 0;
        this.windowList = [];

        // Create root div and shadow DOM
        this.rootdiv = document.createElement("div");
        this.rootdiv.style.zIndex = "9999";
        this.shadowRoot = this.rootdiv.attachShadow({ mode: "open" });

        // Create and append docking zone
        this.leftDock = this.createDockingZone();

        // Add event listeners
        this.addEventListeners();

        // Append to body
        document.body.appendChild(this.rootdiv);

        // Define custom elements if not already defined
        if (!SGui.defined) {
            this.defineCustomElements();
            SGui.defined = true;
        }

        // Add internal styles
        this.addInternalStyles();
    }

    // Method to create and return the docking zone
    createDockingZone() {
        const leftDock = document.createElement("div");
        leftDock.classList.add("docking-zone-overlay");

        const dockContent = document.createElement("div");
        dockContent.classList.add("docking-zone-content");
        dockContent.textContent = "Drop to Dock";
        leftDock.appendChild(dockContent);

        this.shadowRoot.appendChild(leftDock);
        console.log("Docking Zone Created");  // Check if this is logged
        return leftDock;
    }

    // Method to add event listeners for drag-and-drop and window drag start
    addEventListeners() {
        // TODO: Complete Docking logic !!!important
        console.log("binding event listeners "); 
        this.leftDock.addEventListener("dragover", this.handleDragOver.bind(this));
        this.leftDock.addEventListener("dragleave", this.handleDragLeave.bind(this));
        this.leftDock.addEventListener("drop", this.handleDrop.bind(this));
        this.leftDock.addEventListener("click", (e) => { console.log("Docking Zone Clicked")});

        // Listen for window drag start and end events
        document.addEventListener("window-drag-start", this.handleWindowDragStart.bind(this));
        document.addEventListener("window-drag-end", this.handleWindowDragEnd.bind(this));
    }

    // Handle drag over event
    handleDragOver(e) {
        e.preventDefault();

        // Check if the dragged element has the iAmAWindow attribute
        const draggedElement = e.target.closest('.sgui-window');
        console.log(draggedElement)
        console.log("Within drop zone!")
        if (draggedElement && draggedElement.hasAttribute('iAmAWindow')) {
            
            this.leftDock.classList.add("active");
        }
    }
    
    // Handle drag leave event
    handleDragLeave(e) {
        const rect = this.leftDock.getBoundingClientRect();
        if (
            e.clientX <= rect.left ||
            e.clientX >= rect.right ||
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom
        ) {
            this.leftDock.classList.remove("active");
        }
    }
    
    // Handle drop event
    handleDrop(e) {
        e.preventDefault();
        this.leftDock.classList.remove("active");
        
        // Check if the dragged element has the iAmAWindow attribute
        const draggedElement = e.target.closest('.sgui-window');
        if (draggedElement && draggedElement.hasAttribute('iAmAWindow')) {
            console.log("Docked:", draggedElement.dataset.windowId); // Assuming you still need to store windowId in dataset
        }
    }
    
    // Handle window drag start event
    handleWindowDragStart(e) {
        const { windowId } = e.detail;
        console.log(`Window with ID ${windowId} started dragging`);
        // this.leftDock.classList.add("active");
        
        
    }
    
    // Handle window drag end event
    handleWindowDragEnd(e) {
        const { windowId } = e.detail;
        console.log(`Window with ID ${windowId} ended dragging`);

        

        this.leftDock.classList.remove("active");
    }

    // Define custom elements
    defineCustomElements() {
        customElements.define("sgui-file-panel", SGuiFilePanel);
        customElements.define("sgui-input", SGuiInputBox);
        customElements.define("sgui-color-picker", SGuiColorPicker);
        customElements.define("sgui-window", SGuiWindowBase);
    }

    // Method to add internal styles
    addInternalStyles() {
        const styles = document.createElement("style");
        styles.textContent = sgui_css.default;
        this.shadowRoot.appendChild(styles);
    }

    // Method to create a new window
    createWindow(title, isOpen) {
        const sguiWindow = new SGuiWindowBase(
            this.windowId,
            title,
            isOpen,
            this.windowList.length
                ? this.windowList[this.windowList.length - 1].getBoundingClientRect().right
                : 0
        );

        

        this.windowList.push(sguiWindow);
        this.windowId++;

        this.shadowRoot.appendChild(sguiWindow);
        return sguiWindow;
    }
}



export class SGuiWindowBase extends HTMLElement {
    constructor(windowId, title, isOpen, left = 0, top = 0) {
        super();
        this.iAmAWindow = true;
        this.windowId = windowId;
        this.isDragging = false;
        this.style.top = top + "px";
        this.style.left = left + "px";

        this.offsetX = 0;
        this.offsetY = 0;
        this.title = title;
        this.isOpen = isOpen;
    }

    connectedCallback() {
        this.classList.add("sgui-window");

        // Create top bar
        const topBar = this.createTopBar();
        this.appendChild(topBar);

        // Attach event listeners for dragging
        this.attachDragListeners(topBar);

        // Create and append close button
        this.createCloseButton(topBar);
    }

    // Create top bar for window
    createTopBar() {
        const topBar = document.createElement("div");
        topBar.classList.add("top-bar");
        topBar.style.cursor = "grab";

        const title = document.createElement("span");
        title.textContent = this.title;

        topBar.appendChild(title);
        return topBar;
    }

    // Attach dragging event listeners
    attachDragListeners(topBar) {
        topBar.addEventListener("mousedown", this.startDragging.bind(this, topBar));
        document.body.addEventListener("mousemove", this.dragWindow.bind(this));
        topBar.addEventListener("mouseup", this.endDragging.bind(this, topBar));
    }


    startDragging(topBar, e) {
        this.isDragging = true;
        this.offsetX = e.clientX - topBar.getBoundingClientRect().left;
        this.offsetY = e.clientY - topBar.getBoundingClientRect().top;
        topBar.style.cursor = "grabbing";

        // Notify SGui that dragging has started
        this.dispatchEvent(new CustomEvent("window-drag-start", {
            detail: { windowId: this.windowId },
            bubbles: true,
            composed: true
        }));
    }

    // Drag window while mouse moves
    dragWindow(e) {
        if (this.isDragging) {
            this.style.left = e.clientX - this.offsetX + "px";
            this.style.top = e.clientY - this.offsetY + "px";
        }
    }

    // End dragging window
    endDragging(topBar, e) { // Handle window drag start event

        this.isDragging = false;
        topBar.style.cursor = "grab";

        // Notify SGui that dragging has ended
        this.dispatchEvent(new CustomEvent("window-drag-end", {
            detail: { windowId: this.windowId },
            bubbles: true,
            composed: true
        }));
    }

    // Create and append close button
    createCloseButton(topBar) {
        const testbutton = document.createElement("button");
        testbutton.classList.add("close-btn");
        topBar.appendChild(testbutton);
    }

    // Method to append other components (if required)
    appendColorPicker(controller) {
        let colorPicker = new SGuiColorPicker(controller);
        this.appendChild(colorPicker);
        return colorPicker;
    }

    appendInputBox(controller) {
        let inputBox = new SGuiInputBox(controller);
        this.appendChild(inputBox);
        return inputBox;
    }

    appendFilePanel(controller) {
        let filePanel = new SGuiFilePanel(controller);
        this.appendChild(filePanel);
        return filePanel;
    }

    close() {
        this.style.display = "none";
        this.isOpen = false;
    }

    open() {
        this.style.display = "block";
        this.isOpen = true;
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
                heading.textContent = "Files"
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
                fileElement.setAttribute("draggable", "true"); // Make the item draggable

                // Drag and drop logic
                fileElement.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", i); // Store the index of the file
                    fileElement.classList.add("dragging");
                });

                fileElement.addEventListener("dragend", () => {
                    fileElement.classList.remove("dragging");
                });

                fileList.appendChild(fileElement);

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


