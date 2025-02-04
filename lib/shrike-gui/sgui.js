import { sGuiChildList } from "./sgui-child-elements";
import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

/*
 * Things that can be improved on:
 * batching system for events
 */

export class SGui {
    static defined = false;

    constructor() {
        // this.id = 1;
        this.windowList = [];
        this.leftDockContents = [];
        this.rightDockContents = [];
        // Create root div and shadow DOM
        this.rootdiv = document.createElement("div");
        this.rootdiv.style.zIndex = "9999";
        this.shadowRoot = this.rootdiv.attachShadow({ mode: "open" });

        // Append to body
        document.body.appendChild(this.rootdiv);

        // Create and append docking zone
        const { leftDock, rightDock } = this.createDockingZone();
        this.leftDock = leftDock
        this.rightDock = rightDock;

        // Add event listeners
        this.addEventListeners();

        // Define custom elements if not already defined
        if (!SGui.defined) {
            this.defineCustomElements();
            SGui.defined = true;
        }

        // Add internal styles
        this.addInternalStyles();
    }

    // Method to add event listeners for drag-and-drop and window drag start
    addEventListeners() {
        // TODO: Complete Docking logic !!!important
        console.log("binding event listeners ");

        // Custom drag-enter event listener
        this.leftDock.addEventListener(
            "custom-drag-enter",
            this.handleWindowDragEnter.bind(this)
        );

        // Custom drag-leave event listener
        this.leftDock.addEventListener(
            "custom-drag-leave",
            this.handleWindowDragLeave.bind(this)
        );


        this.leftDock.addEventListener("click", (e) => {
            console.log("Docking Zone Clicked");
        });
        // Custom drag-enter event listener
        this.rightDock.addEventListener(
            "custom-drag-enter",
            this.handleWindowDragEnter.bind(this)
        );

        // Custom drag-leave event listener
        this.rightDock.addEventListener(
            "custom-drag-leave",
            this.handleWindowDragLeave.bind(this)
        );


        this.rightDock.addEventListener("click", (e) => {
            console.log("Docking Zone Clicked");
        });



        // Document Event listeners
        document.addEventListener(
            "window-drag-start",
            this.handleWindowDragStart.bind(this)
        );
        document.addEventListener(
            "window-drag-end",
            this.handleWindowDragEnd.bind(this)
        );

        this.shadowRoot.addEventListener("slider-change", (e) => {
            // do something 
            console.log(`Slider ${e.detail.id} changed to ${e.detail.value}`);
        })




    }
    // Method to create and return the docking zone
    createDockingZone() {
        // Create left dock
        const leftDock = document.createElement("div");
        leftDock.classList.add("docking-zone-overlay", "left-dock");

        // Create right dock
        const rightDock = document.createElement("div");
        rightDock.classList.add("docking-zone-overlay", "right-dock");

        // Create the resizable handle for the left dock
        const leftResizeHandle = document.createElement("div");
        leftResizeHandle.classList.add("resize-handle", "left-handle");
        leftDock.appendChild(leftResizeHandle);



        // Add resizing functionality for the left dock
        let isResizingLeft = false;

        leftResizeHandle.addEventListener("mousedown", () => {
            isResizingLeft = true;
            document.body.style.cursor = "col-resize";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isResizingLeft) return;

            const dockRect = leftDock.getBoundingClientRect();
            const newWidth = e.clientX - dockRect.left;

            // Set minimum and maximum width for the dock
            if (newWidth >= 100 && newWidth <= 500) {
                leftDock.style.width = `${newWidth}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            if (isResizingLeft) {
                isResizingLeft = false;
                document.body.style.cursor = "default";
            }
        });

        this.shadowRoot.appendChild(leftDock);


        // Create the resizable handle for the right dock
        const rightResizeHandle = document.createElement("div");
        rightResizeHandle.classList.add("resize-handle", "right-handle");
        rightDock.appendChild(rightResizeHandle);

        // Add resizing functionality for the right dock
        let isResizingRight = false;

        rightResizeHandle.addEventListener("mousedown", () => {
            isResizingRight = true;
            document.body.style.cursor = "col-resize";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isResizingRight) return;

            const dockRect = rightDock.getBoundingClientRect();
            const newWidth = dockRect.right - e.clientX;

            // Set minimum and maximum width for the dock
            if (newWidth >= 100 && newWidth <= 500) {
                rightDock.style.width = `${newWidth}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            if (isResizingRight) {
                isResizingRight = false;
                document.body.style.cursor = "default";
            }
        });

        // Append both docks to the shadow root

        this.shadowRoot.appendChild(rightDock);

        console.log("Docking Zones Created");

        return { leftDock, rightDock };
    }

    reattachResizeHandles(dock, side) {
        if (side === "left") {
            const leftResizeHandle = dock.querySelector('.resize-handle.left-handle');
            if (!leftResizeHandle) {
                const newLeftResizeHandle = document.createElement("div");
                newLeftResizeHandle.classList.add("resize-handle", "left-handle");
                leftDock.appendChild(newLeftResizeHandle);
            }
        }

        else {


            const rightResizeHandle = dock.querySelector('.resize-handle.right-handle');
            if (!rightResizeHandle) {
                const newRightResizeHandle = document.createElement("div");
                newRightResizeHandle.classList.add("resize-handle", "right-handle");
                rightDock.appendChild(newRightResizeHandle);
            }
        }
    }



    handleWindowDragEnter(e) {
        const { id } = e.detail;

        if (id === undefined) {
            console.log("Not a window");
            return;
        }
        console.log(`Window with ID ${id} entered the docking zone`);

    }

    handleWindowDragLeave(e) {
        const { id } = e.detail;

        if (id === undefined) {
            console.log("Not a window");
            return;
        }

        console.log(`Window with ID ${id} left the docking zone`);

    }


    leftDockDrop = (windowElement) => {
        if (windowElement) {
            if (!windowElement.isDocked) {
                if (this.leftDockContents.length === 0) {
                    // Create a new <ul> element to hold the windows
                    const ulElement = document.createElement("ul");
                    ulElement.classList.add("unstyled-list"); // Add class to remove styles
                    this.leftDock.appendChild(ulElement);

                    // reattachResizeHandles(this.leftDock, "left");
                }

                // Add the window element to the leftDockContents array
                this.leftDockContents.push(windowElement);
                try {

                    this.shadowRoot.removeChild(windowElement); // Remove windowElement from the shadow DOM
                } catch (e) {
                    console.error("Tried to remove window from shadowRoot even thugh it isnt a child of it. Parent is: ", windowElement.parentElement)
                }
                windowElement.parent = this.leftDock;

                // Create a new list item for the window
                const liElement = document.createElement("li");
                liElement.classList.add("unstyled-item"); // Add class to remove styles
                liElement.appendChild(windowElement); // Append windowElement as the content of the list item

                // Append this list item as the first child of the <ul>
                const ul = this.leftDock.querySelector("ul");
                ul.appendChild(liElement);

                // Resize the dock to match the window's width
                this.leftDock.style.width = `${windowElement.offsetWidth + 5}px`;



                windowElement.style.position = "static";
                windowElement.style.margin = "0"; // Reset any unintended margins
                windowElement.isDocked = true;
                this.leftDock.classList.add("docked");
                this.leftDock.classList.remove("active");
                // Set all windows in the dock to same width:
                for (const window of this.leftDockContents) {
                    window.style.width = `${windowElement.offsetWidth}px`
                }
            }
        } else {
            console.log("Nothing to dock!")
        }
    }

    // create a right dock drop
    rightDockDrop = (windowElement) => {
        if (windowElement) {
            if (!windowElement.isDocked) {
                if (this.rightDockContents.length === 0) {
                    // Create a new <ul> element to hold the windows
                    const ulElement = document.createElement("ul");
                    ulElement.classList.add("unstyled-list"); // Add class to remove styles
                    this.rightDock.appendChild(ulElement);
                    // reattachResizeHandles(this.rightDock, "right");
                }


                // Add the window element to the rightDockContents array
                this.rightDockContents.push(windowElement);
                console.log("right dock contents: " + this.rightDockContents.length)
                try {

                    this.shadowRoot.removeChild(windowElement); // Remove windowElement from the shadow DOM
                } catch (e) {
                    console.error("Tried to remove window from shadowRoot even thugh it isnt a child of it. Parent is: ", windowElement.parentElement)
                }
                windowElement.parent = this.rightDock;

                // Create a new list item for the window
                const liElement = document.createElement("li");
                liElement.classList.add("unstyled-item"); // Add class to remove styles
                liElement.appendChild(windowElement); // Append windowElement as the content of the list item

                // Append this list item as the first child of the <ul>
                const ul = this.rightDock.querySelector("ul");
                ul.appendChild(liElement);

                // Resize the dock to match the window's width
                this.rightDock.style.width = `${windowElement.offsetWidth + 5}px`;


                console.log("Window (x) is now at " + windowElement.style.left + "px");
                windowElement.style.position = "static";
                windowElement.style.margin = "0"; // Reset any unintended margins

                windowElement.isDocked = true;
                this.rightDock.classList.add("docked");
                this.rightDock.classList.remove("active");
                // Set all windows in the dock to same width:
                for (const window of this.rightDockContents) {
                    window.style.width = `${windowElement.offsetWidth}px`
                }
            }
        } else {
            console.log("Nothing to dock!")
        }
    }

    handleUndock = (windowElement, close = false) => {
        if (windowElement) {
            // const windowElement = this.shadowRoot.getElementById(this.draggingWindow.id); // Get the window element by its ID (fix logic)
            windowElement.isDocked = false; // Un-dock the window
            if (this.leftDockContents.length === 1) {
                console.log(this.leftDockContents.length - 1 + " elements")
                // Clear the contents of the left dock, preserving the resize handle
                while (this.leftDock.firstChild) {
                    if (!this.leftDock.firstChild.classList.contains("resize-handle")) {
                        this.leftDock.removeChild(this.leftDock.firstChild);
                    } else {
                        // Skip the resize handle
                        break;
                    }
                }

                this.leftDock.classList.remove("docked");
                this.leftDock.style.width = 160 + "px";

            } else { console.log("Dock Contents: ", this.leftDockContents.length) }
            // clear the leftDockContents array if necessary
            const index = this.leftDockContents.indexOf(windowElement);
            if (index !== -1) {
                this.leftDockContents.splice(index, 1); // Remove the window from the dock list
            }

            // if (!close) {

            // Add the window back to the shadowRoot
            this.shadowRoot.appendChild(windowElement);
            windowElement.parent = this.shadowRoot;
            windowElement.style.position = "fixed";
            // }

        } else {
            console.log("Nothing to undock!")
        }
    }

    // right undock
    handleRightUndock = (windowElement, close = false) => {
        if (windowElement) {

            windowElement.isDocked = false;
            if (this.rightDockContents.length === 1) {
                console.log(this.rightDockContents.length - 1 + " elements")
                while (this.rightDock.firstChild) {
                    if (!this.rightDock.firstChild.classList.contains("resize-handle")) {
                        this.rightDock.removeChild(this.rightDock.firstChild);
                    } else {
                        // Skip the resize handle
                        break;
                    }
                }
                this.rightDock.classList.remove("docked");
                this.rightDock.style.width = 160 + "px";

            } else { console.log("Dock Contents: ", this.rightDockContents.length) }
            // clear the rightDockContents array if necessary
            const index = this.rightDockContents.indexOf(windowElement);
            if (index !== -1) {
                this.rightDockContents.splice(index, 1); // Remove the window from the dock list
            }

            // if (!close) {
            // Add the window back to the shadowRoot
            this.shadowRoot.appendChild(windowElement);
            windowElement.parent = this.shadowRoot;
            windowElement.style.position = "fixed";
            // }
        } else {
            console.log("Nothing to undock!")
        }
    }


    // Handle window drag start event
    handleWindowDragStart(e) {
        const { id } = e.detail;
        const windowElement = this.shadowRoot.getElementById(id); // Get the window element by its ID
        this.draggingWindow = windowElement;
        console.log(`Window with ID ${id} started dragging`);

        // Get bounding rects of the docks
        const leftDockRect = this.leftDock.getBoundingClientRect();
        const rightDockRect = this.rightDock.getBoundingClientRect();

        // Listen for mousemove to track mouse position while dragging
        const onMouseMove = (moveEvent) => {

            // **Left Dock Logic**

            // Condition 1: Docking from Shadow DOM to Left Dock
            if (moveEvent.clientX < leftDockRect.right && !windowElement.isDocked) {
                this.leftDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.leftDock.classList.add("active");
            }

            // Condition 2: Undocking from Left Dock to Shadow DOM
            else if (moveEvent.clientX >= leftDockRect.right && windowElement.isDocked && windowElement.dockedTo === "left") {
                this.leftDock.dispatchEvent(
                    new CustomEvent("custom-drag-leave", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
            }

            // Condition 3: Dragging a docked window within Left Dock
            else if (moveEvent.clientX <= leftDockRect.right && windowElement.isDocked && windowElement.dockedTo === "left") {
                this.draggingWindow.style.position = "fixed";
            }

            // **Right Dock Logic**
            // Condition 1: Docking from Shadow DOM to Right Dock
            if (moveEvent.clientX > rightDockRect.left && moveEvent.clientX < rightDockRect.right && !windowElement.isDocked) {
                this.rightDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.rightDock.classList.add("active");
            }

            // Condition 2: Undocking from Right Dock to Shadow DOM
            else if (moveEvent.clientX <= rightDockRect.left && windowElement.isDocked && windowElement.dockedTo === "right") {
                this.rightDock.dispatchEvent(
                    new CustomEvent("custom-drag-leave", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
            }

            // Condition 3: Dragging a docked window within Right Dock
            else if (moveEvent.clientX >= rightDockRect.left && windowElement.isDocked && windowElement.dockedTo === "right") {
                this.draggingWindow.style.position = "fixed";
            }
        };

        // Handle cleanup on mouseup
        const onMouseUp = (moveUpEvent) => {
            console.log(`Dragging ended for window with ID ${id}`);

            // Left Dock Drop Logic
            if (moveUpEvent.clientX < leftDockRect.right && !windowElement.isDocked) {
                this.leftDockDrop(windowElement);
                windowElement.dockedTo = "left";
            }

            // Right Dock Drop Logic
            else if (moveUpEvent.clientX > rightDockRect.left && !windowElement.isDocked) {
                this.rightDockDrop(windowElement);
                windowElement.dockedTo = "right";
            }

            // Undocking from Left Dock
            else if (moveUpEvent.clientX >= leftDockRect.right && windowElement.isDocked && windowElement.dockedTo === "left") {
                this.handleUndock(windowElement);
            }

            // Undocking from Right Dock
            else if (moveUpEvent.clientX <= rightDockRect.left && windowElement.isDocked && windowElement.dockedTo === "right") {
                this.handleRightUndock(windowElement);
            }

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        // Add mousemove and mouseup event listeners
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        // this.draggingWindow = undefined;
    }


    // Handle window drag end event
    handleWindowDragEnd(e) {
        const { id } = e.detail;
        console.log(`Window with ID ${id} ended dragging`);
        this.draggingWindow = undefined;
    }

    // Define custom elements
    defineCustomElements() {
        customElements.define("sgui-file-panel", SGuiFilePanel);
        customElements.define("sgui-input", SGuiInputBox);
        customElements.define("sgui-color-picker", SGuiColorPicker);
        customElements.define("sgui-window", SGuiWindowBase);
        customElements.define("sgui-slider", SGuiSlider)
        for (const customElement of sGuiChildList) {
            customElements.define(customElement.name.charAt(0).toLowerCase() + customElement.name.slice(1).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), customElement)
            console.log(customElement)
        }
    }

    // Method to add internal styles
    addInternalStyles() {
        const styles = document.createElement("style");
        styles.textContent = sgui_css.default;
        this.shadowRoot.appendChild(styles);
    }

    // Method to create a new window
    createWindow = (title, isOpen) => {
        const sguiWindow = new SGuiWindowBase(
            // this.id,
            title,
            isOpen,
            this.windowList.length
                ? this.windowList[
                    this.windowList.length - 1
                ].getBoundingClientRect().right + 120
                : 0,
            0
        );

        this.windowList.push(sguiWindow);
        // this.id++;

        this.shadowRoot.appendChild(sguiWindow);
        return sguiWindow;
    }
}

export class SGuiWindowBase extends HTMLElement {
    static nextId = 0;
    constructor(title, isOpen, left = 0, top = 0) {
        super();
        this.iAmAWindow = true;
        // this.id = id;
        this.isDragging = false;
        this.isDocked = false;
        this.style.top = top + "px";
        this.style.left = left + "px";
        this.parent = this.parentElement;
        // add right dock

        this.offsetX = 0;
        this.offsetY = 0;
        this.title = title;
        this.isOpen = isOpen;
        this.classList.add("sgui-window");
        this.id = "window-" + SGuiWindowBase.nextId++;
        // Create top bar
        const topBar = this.createTopBar();
        this.appendChild(topBar);

        // Attach event listeners for dragging
        this.attachDragListeners(topBar);

        // Create and append close button
        // this.createCloseButton(topBar);
    }


    // Create top bar for window
    createTopBar() {
        const topBar = document.createElement("div");
        topBar.classList.add("top-bar");
        topBar.id = "topbar-" + this.id;
        topBar.style.cursor = "grab";

        const title = document.createElement("span");
        title.textContent = this.title;
        title.style.userSelect = "none";

        topBar.appendChild(title);
        return topBar;
    }

    // Attach dragging event listeners
    attachDragListeners(topBar) {
        topBar.addEventListener(
            "mousedown",
            this.startDragging.bind(this, topBar)
        );
        document.body.addEventListener("mousemove", this.dragWindow.bind(this));
        topBar.addEventListener("mouseup", this.endDragging.bind(this, topBar));
    }

    startDragging(topBar, e) {
        this.isDragging = true;
        this.offsetX = e.clientX - topBar.getBoundingClientRect().left;
        this.offsetY = e.clientY - topBar.getBoundingClientRect().top;
        topBar.style.cursor = "grabbing";

        // Store id globally or in the dock
        document.currentDraggingWindowId = this.id;

        // Notify SGui that dragging has started
        this.dispatchEvent(
            new CustomEvent("window-drag-start", {
                detail: { id: this.id },
                bubbles: true,
                composed: true,
            })
        );
    }

    // Drag window while mouse moves
    dragWindow(e) {
        if (this.isDragging) {


            this.style.left = e.clientX - this.offsetX + "px";
            this.style.top = e.clientY - this.offsetY + "px";
        }
    }

    // End dragging window
    endDragging(topBar, e) {
        // Handle window drag start event

        this.isDragging = false;
        topBar.style.cursor = "grab";

        // Notify SGui that dragging has ended
        this.dispatchEvent(
            new CustomEvent("window-drag-end", {
                detail: { id: this.id },
                bubbles: true,
                composed: true,
            })
        );
    }

    // Create and append close button
    // createCloseButton(topBar) {
    //     const testbutton = document.createElement("button");
    //     testbutton.classList.add("close-btn");
    //     testbutton.onclick = () => {
    //         this.dispatchEvent(
    //             new CustomEvent("window-close", {
    //                 detail: { id: this.id, window: this },
    //                 bubbles: true,
    //                 composed: true,
    //             })
    //         );
    //         this.close();
    //     }
    //     topBar.appendChild(testbutton);
    // }

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

    // appendSlider(customOptions, element) {

    //     let slider = new SGuiSlider(element = element, customOptions);
    //     this.appendChild(slider);
    //     return slider;
    // }

    close() {
        this.style.display = "none";
        this.isOpen = false;
    }

    open() {
        this.style.display = "block";
        this.isOpen = true;
        // Notify SGui that window has been opened
        this.parent.appendChild(this);
    }
}

class SGuiColorPicker extends HTMLElement {
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "colorPicker-" + SGuiColorPicker.nextId++;


        // this.colorState = colorState;
        const defaultOptions = {
            colorState: null,
            customClasses: [],
            colorPickerWidth: 300,
            colorPickerPadding: 10
        }
        this.options = { ...defaultOptions, ...customOptions }
        const pickerDiv = document.createElement("div");

        pickerDiv.id = "picker"; // TODO: update this
        pickerDiv.classList.add(this.options.customClasses, "sgui-color-picker", "sgui-base");
        this.appendChild(pickerDiv);
        const colorPicker = new iro.ColorPicker(pickerDiv, {
            width: this.options.colorPickerWidth,
            padding: this.options.colorPickerPadding,
        });
        colorPicker.on("color:change", (color) => {
            this.colorState.r = color.rgb.r;
            this.colorState.g = color.rgb.g;
            this.colorState.b = color.rgb.b;
            console.log(color)
            this.element.dispatchEvent(new CustomEvent("color-change", {
                detail: {
                    id: this.id,
                    rgb: color.rgb
                }
            }))
        });
    }
}

class SGuiInputBox extends HTMLElement {
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


// File Panel
export class SGuiFilePanel extends HTMLElement {
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "filePanel-" + SGuiFilePanel.nextId++;
        // this.controller = controller;
        const defaultOptions = {
            files: [],
            currentContext: null,
            customClasses: [],
        }
        this.options = { ...defaultOptions, ...customOptions }
        const filePanel = document.createElement("div");
        const fileList = document.createElement("ul");
        const heading = document.createElement("div");
        filePanel.appendChild(heading);

        fileList.classList.add("sgui-file-list");
        filePanel.classList.add(...this.options.customClasses,
            "sgui-file-panel",
            "sgui-base",
            "drop-zone",
            "file-placeholder"
        );

        const placeholder = document.createElement("div");
        placeholder.textContent = "Wow, such empty.";
        placeholder.classList.add("file-placeholder");
        filePanel.appendChild(placeholder);

        // Function to update placeholder visibility
        const updatePlaceholder = () => {
            if (this.options.files.length === 0) {
                placeholder.style.display = "block";
            } else {
                placeholder.style.display = "none";
                heading.textContent = "Files";
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
                this.options.files.push(file); // Add file to the controller

                const fileElement = document.createElement("li");
                fileElement.textContent = file.name;
                fileElement.setAttribute("draggable", "true"); // Make the item draggable

                fileElement.addEventListener("dragstart", (e) => {
                    // Store the index of the file
                    e.dataTransfer.setData("text/plain", i);
                    // Add the file to the DataTransfer object
                    const dataTransfer = e.dataTransfer;
                    dataTransfer.items.add(file);
                    fileElement.classList.add("dragging");
                    this.options.currentContext = file;
                    console.log("Context set to", this.options.currentContext);
                });

                fileElement.addEventListener("dragend", () => {
                    fileElement.classList.remove("dragging");
                });

                fileList.appendChild(fileElement);

                // TODO: Add an event listener to set context to a clicked li element
                fileElement.addEventListener("click", () => {
                    // TODO: set context to the index/id of the clicked li element
                    this.options.currentContext = file;
                    console.log("Context set to", this.options.currentContext);
                });
                fileList.appendChild(fileElement);

                console.log(`… file[${i}].name = ${file.name}`);
            });

            updatePlaceholder(); // Hide placeholder after adding files
        });

        // TODO: Handle dropping files within different panels

        let isDragging = false;

        filePanel.addEventListener("dragstart", (e) => {
            isDragging = true;
            console.log("Drag started");
        });

        filePanel.addEventListener("dragover", (ev) => {
            console.log("File(s) in drop zone");
            placeholder.textContent = "Drop ze bomb";
            ev.preventDefault(); // Prevent default to allow drop

        });

        filePanel.addEventListener("dragleave", (ev) => {
            placeholder.textContent = "Wow, such empty.";
            ev.preventDefault(); // Prevent default to allow drop
            if (isDragging) {
                console.log("Item dragged outside the filePanel");
            }

        });

        document.addEventListener("dragover", (ev) => {
            ev.preventDefault(); // Prevent default to allow drop
            return false;
        })

        // Event listener for when the item is dropped outside the filePanel
        document.addEventListener("drop", (e) => {
            e.preventDefault();
            if (isDragging) {
                // Check if the drop occurred outside the filePanel
                if (!filePanel.contains(e.target)) {
                    console.log("Item dropped outside the filePanel");
                    let fileContent = "";
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        console.log("File content:", e.target.result);
                        fileContent = e.target.result;
                    };

                    reader.onerror = (error) => {
                        console.error("Error reading file:", error);
                    };

                    reader.readAsText(this.options.currentContext);

                    e.target.dispatchEvent(new CustomEvent("file-drop",
                        {
                            detail: {
                                file: this.options.currentContext,
                                content: fileContent,
                            },
                            bubbles: true,
                            composed: true,
                        }
                    ))
                }
                isDragging = false; // Reset the dragging state
            }
        });

        // Event listener to reset the dragging state if the drag operation is canceled
        document.addEventListener("dragend", () => {
            isDragging = false;
            console.log("Drag ended");
        });





        filePanel.appendChild(fileList);
        this.appendChild(filePanel);

        // Initially update the placeholder based on existing files
        updatePlaceholder();
    }
}

export class SGuiSlider extends HTMLElement {
    static nextId = 0;
    constructor(element = null, customOptions = {}) {
        super();
        // this.label = label;
        this.element = element;

        this.id = "slider-" + SGuiSlider.nextId++;

        const defaultOptions = {
            sliderState: { value: 0 },
            customClasses: [],
            label: "",
        }
        this.options = { ...defaultOptions, ...customOptions }

        // Create a container div for the slider
        const sliderDiv = document.createElement("div");
        sliderDiv.id = `sliderDiv-${this.id}`; // Assign a unique ID
        sliderDiv.classList.add(...this.options.customClasses, "sgui-slider", "sgui-base");
        this.appendChild(sliderDiv);

        // Create the label
        const labelDiv = document.createElement("div");
        labelDiv.classList.add("slider-label");
        labelDiv.textContent = this.options.label || `Slider ${this.id}`;
        sliderDiv.appendChild(labelDiv);

        // Create the range input
        const sliderInput = document.createElement("input");
        sliderInput.type = "range";
        sliderInput.min = "0";
        sliderInput.max = "100";
        sliderInput.value = this.options.sliderState.value || "50";
        sliderInput.classList.add("slider-input");

        // Create a display for the current slider value
        const valueDisplay = document.createElement("div");
        valueDisplay.classList.add("slider-value-display");
        valueDisplay.textContent = sliderInput.value;

        // Append the slider input and value display to the slider container
        sliderDiv.appendChild(sliderInput);
        sliderDiv.appendChild(valueDisplay);

        // Add event listener for the slider input
        sliderInput.addEventListener("input", (event) => {
            const value = event.target.value;

            // Update state
            this.options.sliderState.value = value;

            // Update the value display
            valueDisplay.textContent = value;

            console.log(this.element)
            // Dispatch event
            this.element.dispatchEvent(
                new CustomEvent("slider-change", {
                    detail: { value, id: this.id },
                    bubbles: true,
                    composed: true,
                })
            );
        });
    }

}

