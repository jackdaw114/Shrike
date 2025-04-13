import SGuiButton from "./child-elements/button";
import SGuiColorPicker from "./child-elements/color-picker";
import SGuiContainer from "./child-elements/container";
import SGuiDropDown from "./child-elements/drop-down";
import SGuiFilePanel from "./child-elements/file-panel";
import SGuiInputBox from "./child-elements/input-box";
import SGuiList from "./child-elements/list";
import SGuiSlider from "./child-elements/slider";
import SGuiText from "./child-elements/text";
import SGuiWindowBase from "./child-elements/window";
import SGuiCheckbox from "./child-elements/checkbox";
import * as sgui_css from "./sgui-css.css?inline";
import iro from "@jaames/iro";

const sGuiChildList = [
    { class: SGuiColorPicker, name: 's-gui-color-picker' },
    { class: SGuiInputBox, name: 's-gui-input-box' },
    { class: SGuiText, name: 's-gui-text' },
    { class: SGuiButton, name: 's-gui-button' },
    { class: SGuiContainer, name: 's-gui-container' },
    { class: SGuiSlider, name: 's-gui-slider' },
    { class: SGuiFilePanel, name: 's-gui-file-panel' },
    { class: SGuiWindowBase, name: 's-gui-window' },
    { class: SGuiDropDown, name: 's-gui-drop-down' },
    { class: SGuiList, name: 's-gui-list' },
    { class: SGuiCheckbox, name: 's-gui-checkbox' }
];

export class SGui {
    static defined = false;

    constructor() {
        console.log("sguiChildList",sGuiChildList)
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
        for (const { class: customElement, name } of sGuiChildList) {
            console.log("Registering custom element:", name);
            customElements.define(name, customElement);
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
                ? Math.min(this.windowList[
                    this.windowList.length - 1
                ].getBoundingClientRect().right + 120,
                window.innerWidth - 120
                )
                : 0,
            0
        );
        
        this.windowList.push(sguiWindow);
        // this.id++;

        this.shadowRoot.appendChild(sguiWindow);
        return sguiWindow;
    }
}

