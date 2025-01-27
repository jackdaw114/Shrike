import {sGuiChildList} from "./sgui-child-elements";
import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

/*
 * Things that can be improved on:
 * batching system for events
 */

export class SGui {
    static defined = false;

    constructor() {
        this.windowId = 0;
        this.windowList = [];
        this.leftDockContents = [];
        // Create root div and shadow DOM
        this.rootdiv = document.createElement("div");
        this.rootdiv.style.zIndex = "9999";
        this.shadowRoot = this.rootdiv.attachShadow({ mode: "open" });

        // Append to body
        document.body.appendChild(this.rootdiv);

        // Create and append docking zone
        this.leftDock = this.createDockingZone();
        // this.leftDock.addEventListener("mouseup", this.leftDockDrop);

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

        // Event listeners for dock
        this.leftDock.addEventListener("mouseenter", (e) => {
            // do something 
        });

        this.leftDock.addEventListener("mouseleave", (e) => {
            // do something
        });



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

        // Document Event listeners
        document.addEventListener(
            "window-drag-start",
            this.handleWindowDragStart.bind(this)
        );
        document.addEventListener(
            "window-drag-end",
            this.handleWindowDragEnd.bind(this)
        );

        document.addEventListener(
            "window-close",
            (e) => {
                // remove window from leftDockContents
                this.handleUndock(e.detail.window,true);
                // remove window from window list
                let index = this.windowList.indexOf(e.detail.window);
                if (index!== -1) {
                    this.windowList.splice(index, 1); // Remove the window from the window list
                }

                console.log("Window with id " + e.detail.windowId + " closed")
            }
        );

        // document.addEventListener("mouseup", this.handleUndock)

        this.shadowRoot.addEventListener("slider-change", (e) => {
            // do something 
            console.log(`Slider ${e.detail.id} changed to ${e.detail.value}`);
        })

        


    }
    // Method to create and return the docking zone
    createDockingZone() {
        const leftDock = document.createElement("div");
        leftDock.classList.add("docking-zone-overlay");
    
        // Create the resizable handle
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("resize-handle");
    
        // Append the resize handle to the left dock
        leftDock.appendChild(resizeHandle);
    
        // Add event listeners for resizing
        let isResizing = false;
    
        resizeHandle.addEventListener("mousedown", (e) => {
            isResizing = true;
            document.body.style.cursor = "col-resize";
        });
    
        document.addEventListener("mousemove", (e) => {
            if (!isResizing) return;
    
            const dockRect = leftDock.getBoundingClientRect();
            const newWidth = e.clientX - dockRect.left; // Calculate new width based on mouse position
    
            // Set minimum and maximum width for the dock
            if (newWidth >= 100 && newWidth <= 500) {
                leftDock.style.width = `${newWidth}px`;
            }
        });
    
        document.addEventListener("mouseup", () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = "default";
            }
        });
    
        this.shadowRoot.appendChild(leftDock);
        console.log("Docking Zone Created");
    
        return leftDock;
    }
    

    handleWindowDragEnter(e) {
        const { windowId } = e.detail;

        if (windowId === undefined) {
            console.log("Not a window");
            return;
        }

        console.log(`Window with ID ${windowId} entered the docking zone`);

    }

    handleWindowDragLeave(e) {
        const { windowId } = e.detail;

        if (windowId === undefined) {
            console.log("Not a window");
            return;
        }

        console.log(`Window with ID ${windowId} left the docking zone`);

    }


    leftDockDrop = (windowElement) => {
        if (windowElement) {

            // const windowElement = this.shadowRoot.getElementById(this.draggingWindow.id);
            if (!windowElement.isDocked) {
                if (this.leftDockContents.length === 0) {
                    // Create a new <ul> element to hold the windows
                    const ulElement = document.createElement("ul");
                    ulElement.classList.add("unstyled-list"); // Add class to remove styles
                    this.leftDock.appendChild(ulElement);
                }
                

                // Add the window element to the leftDockContents array
                this.leftDockContents.push(windowElement);
                this.shadowRoot.removeChild(windowElement); // Remove windowElement from the shadow DOM

                // Create a new list item for the window
                const liElement = document.createElement("li");
                liElement.classList.add("unstyled-item"); // Add class to remove styles
                liElement.appendChild(windowElement); // Append windowElement as the content of the list item

                // Append this list item as the first child of the <ul>
                const ul = this.leftDock.querySelector("ul");
                ul.appendChild(liElement);

                // Resize the dock to match the window's width
                this.leftDock.style.width = `${windowElement.offsetWidth}px`;

                

                windowElement.style.left = `${this.leftDock.offsetLeft}px`;
                windowElement.style.top = `${this.leftDock.offsetTop}px`;
                windowElement.style.position = "relative";
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


    handleUndock = (windowElement,close=false) => {
        if (windowElement) {
            // const windowElement = this.shadowRoot.getElementById(this.draggingWindow.id); // Get the window element by its ID (fix logic)
            windowElement.isDocked = false; // Un-dock the window
            if (this.leftDockContents.length === 1) {
                console.log(this.leftDockContents.length - 1 + " elements")
                this.leftDock.innerHTML = "";
                this.leftDock.classList.remove("docked");
                this.leftDock.style.width = 160 + "px";
               
            } else { console.log("Dock Contents: ",this.leftDockContents.length)}
            // clear the leftDockContents array if necessary
            const index = this.leftDockContents.indexOf(windowElement);
            if (index !== -1) {
                this.leftDockContents.splice(index, 1); // Remove the window from the dock list
            }

            if (!close) {
                // Add the window back to the shadowRoot
                this.shadowRoot.appendChild(windowElement);
                windowElement.style.position = "fixed";
                this.draggingWindow = undefined; // Clear the dragging window id
            }
        } else {
            console.log("Nothing to undock!")
        }
    }

    // Handle window drag start event
    handleWindowDragStart(e) {
        const { windowId } = e.detail;
        const windowElement = this.shadowRoot.getElementById(windowId); // Get the window element by its ID
        this.draggingWindow = windowElement;
        console.log(`Window with ID ${windowId} started dragging`);

        // Get bounding rect of the dock
        const dockRect = this.leftDock.getBoundingClientRect();

        // Listen for mousemove to track mouse position while dragging
        const onMouseMove = (moveEvent) => {

            // Condition 1 : Docking from Shadow DOM to Dock element

            // Check if the mouse crosses the leftDock.right boundary and if teh window is not currently docked
            if (moveEvent.clientX < dockRect.right && !windowElement.isDocked) {
                // Dispatch custom drag enter event
                
                this.leftDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { windowId },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.leftDock.classList.add("active");
                

            }

            // Condition 2 : Undocking from Dock Element to Shadow DOM

            else if (moveEvent.clientX >= dockRect.right && windowElement.isDocked) {
                // Dispatch custom drag leave event
                // windowElement.style.top = (moveEvent.clientY) + "px";
               
                this.leftDock.dispatchEvent(
                    new CustomEvent("custom-drag-leave", {
                        detail: { windowId },
                        bubbles: true,
                        composed: true,
                    })
                );
            }

            // Condition 3 : Dragging a docked window within Dock Element
            else if (moveEvent.clientX <= dockRect.right && windowElement.isDocked) {
                // windowElement.style.top = (moveEvent.clientY - windowElement.offsetY ) + "px";
                // windowElement.style.left = (moveEvent.clientX - windowElement.offsetX) + "px";
                // windowElement.offsetX = 0;
                // windowElement.offsetY = 0;
                // windowElement.style.top = `${this.leftDock.offsetTop}px`;
                // windowElement.style.left = `${0}px`;
                this.draggingWindow.style.position = "fixed";
                
                
            }
        };

        // Handle cleanup on mouseup
        const onMouseUp = (moveUpEvent) => {
            console.log(`Dragging ended for window with ID ${windowId}`);
            if (moveUpEvent.clientX < dockRect.right && !windowElement.isDocked) {
                this.leftDockDrop(windowElement);
                
            } else if (moveUpEvent.clientX >= dockRect.right && windowElement.isDocked) {
                this.handleUndock(windowElement);
               
            }
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            this.draggingWindow = undefined;
        };

        // Add mousemove and mouseup event listeners
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    // Handle window drag end event
    handleWindowDragEnd(e) {
        const { windowId } = e.detail;
        console.log(`Window with ID ${windowId} ended dragging`);
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
            customElements.define(customElement.name.charAt(0).toLowerCase()+ customElement.name.slice(1).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), customElement)
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
            this.windowId,
            title,
            isOpen,
            this.windowList.length
                ? this.windowList[
                    this.windowList.length - 1
                ].getBoundingClientRect().right + 120
                : 0,
            0,
            this.leftDock
        );

        this.windowList.push(sguiWindow);
        this.windowId++;

        this.shadowRoot.appendChild(sguiWindow);
        return sguiWindow;
    }
}

export class SGuiWindowBase extends HTMLElement {
    constructor(windowId, title, isOpen, left = 0, top = 0, dock) {
        super();
        this.iAmAWindow = true;
        this.windowId = windowId;
        this.isDragging = false;
        this.isDocked = false;
        this.style.top = top + "px";
        this.style.left = left + "px";
        this.dockBoundaryRight = dock.getBoundingClientRect().right;

        this.offsetX = 0;
        this.offsetY = 0;
        this.title = title;
        this.isOpen = isOpen;
        this.classList.add("sgui-window");
        this.id = this.windowId;
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
        topBar.id = "topbar-" + this.windowId;
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

        // Store windowId globally or in the dock
        document.currentDraggingWindowId = this.windowId;

        // Notify SGui that dragging has started
        this.dispatchEvent(
            new CustomEvent("window-drag-start", {
                detail: { windowId: this.windowId},
                bubbles: true,
                composed: true,
            })
        );
    }

    // Drag window while mouse moves
    dragWindow(e) {
        if (this.isDragging) {
            if (this.isDocked && ((e.clientX - this.offsetX) < this.dockBoundaryRight)) {
                // do nothing
            }

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
                detail: { windowId: this.windowId },
                bubbles: true,
                composed: true,
            })
        );
    }

    // Create and append close button
    createCloseButton(topBar) {
        const testbutton = document.createElement("button");
        testbutton.classList.add("close-btn");
        testbutton.onclick = () => { 
            this.dispatchEvent(
                new CustomEvent("window-close", {
                    detail: { windowId: this.windowId, window: this },
                    bubbles: true,
                    composed: true,
                })
            );
            this.close();
        }
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

    appendSlider(controller) {
        let slider = new SGuiSlider(controller);
        this.appendChild(slider);
        return slider;
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
        const filePanel = document.createElement("div");
        const fileList = document.createElement("ul");
        const heading = document.createElement("div");
        filePanel.appendChild(heading);

        fileList.classList.add("sgui-file-list");
        filePanel.classList.add(
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
            if (this.controller.files.length === 0) {
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
                    this.controller.currentContext = file;
                });
                fileList.appendChild(fileElement);

                console.log(`… file[${i}].name = ${file.name}`);
            });

            updatePlaceholder(); // Hide placeholder after adding files
        });

        filePanel.addEventListener("dragover", (ev) => {
            console.log("File(s) in drop zone");
            placeholder.textContent = "Drop ze bomb";
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

export class SGuiSlider extends HTMLElement {
    static nextId = 0;
    constructor(sliderState, element) {
        super();
        this.element = element;
        this.sliderState = sliderState;
        this.sliderId = SGuiSlider.nextId++;
        // Create a container div for the slider
        const sliderDiv = document.createElement("div");
        sliderDiv.id = `slider-${this.sliderId}`; // Assign a unique ID
        sliderDiv.classList.add("sgui-slider", "sgui-base");
        this.appendChild(sliderDiv);
    
        // Create the range input
        const sliderInput = document.createElement("input");
        sliderInput.type = "range";
        sliderInput.min = "0";
        sliderInput.max = "100";
        sliderInput.value = this.sliderState.value || "50"; 
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
            this.sliderState.value = value;
    
            // Update the value display
            valueDisplay.textContent = value;
    
            // Dispatch event
            this.element.dispatchEvent(
                new CustomEvent("slider-change", {
                    detail: { value, sliderId: this.sliderId },
                    bubbles: true,
                    composed: true,
                })
            );
        });
    }

}
