import SGuiButton from "./child-elements/button";
import SGuiColorPicker from "./child-elements/color-picker";
import SGuiContainer from "./child-elements/container";
import SGuiDock from "./child-elements/dock";
import SGuiFilePanel from "./child-elements/file-panel";
import SGuiInputBox from "./child-elements/input-box";
import SGuiSlider from "./child-elements/slider";
import SGuiText from "./child-elements/text";
import SGuiWindowBase from "./child-elements/window";
import * as sgui_css from "./sgui-css.css?inline";

/*
* Things that can be improved on:
* batching system for events
*/

const sGuiChildList = [SGuiDock, SGuiColorPicker, SGuiInputBox, SGuiText, SGuiButton, SGuiContainer, SGuiSlider, SGuiFilePanel, SGuiWindowBase]

export class SGui {
    static defined = false;

    constructor() {
        // this.id = 1;
        // Define custom elements if not already defined
        if (!SGui.defined) {
            this.defineCustomElements();
            SGui.defined = true;
        }
        this.windowList = [];

        // Create root div and shadow DOM
        this.rootdiv = document.createElement("div");
        this.rootdiv.style.zIndex = "9999";
        this.shadowRoot = this.rootdiv.attachShadow({ mode: "open" });

        // Append to body
        document.body.appendChild(this.rootdiv);

        // Create and append docking zone
        const leftDock = new SGuiDock("left", this.shadowRoot);
        const rightDock = new SGuiDock("right", this.shadowRoot);
        const topDock = new SGuiDock("top", this.shadowRoot);
        this.leftDock = leftDock
        this.rightDock = rightDock;
        this.topDock = topDock;

        // Add event listeners
        this.addEventListeners();


        // Add internal styles
        this.addInternalStyles();
    }

    // Method to add event listeners for drag-and-drop and window drag start
    addEventListeners() {
        // TODO: Complete Docking logic !!!important
        console.log("binding event listeners ");


        this.leftDock.addEventListener("click", (e) => {
            console.log("Docking Zone Clicked");
        });

        this.rightDock.addEventListener("click", (e) => {
            console.log("Docking Zone Clicked");
        });
        this.topDock.addEventListener("click", (e) => {
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



    // Handle window drag start event
    handleWindowDragStart(e) {
        const { id } = e.detail;
        const windowElement = this.shadowRoot.getElementById(id); // Get the window element by its ID
        this.draggingWindow = windowElement;
        console.log(`Window with ID ${id} started dragging`);

        // Get bounding rects of the docks
        const leftDockRect = this.leftDock.getBoundingClientRect();
        const rightDockRect = this.rightDock.getBoundingClientRect();
        const topDockRect = this.topDock.getBoundingClientRect();

        // Listen for mousemove to track mouse position while dragging
        const onMouseMove = (moveEvent) => {
            // **Left Dock Logic**
            console.log("windowElement.isDocked = " + windowElement.isDocked);

            // Condition 1: Docking from Shadow DOM to Left Dock - Debug Event
            if (moveEvent.clientX < leftDockRect.right && !windowElement.isDocked) {
                this.leftDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.leftDock.dock.classList.add("active");
            }

            // Condition 2: Undocking from Left Dock to Shadow DOM - Debug Event
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
            // Condition 1: Docking from Shadow DOM to Right Dock - Debug Event
            if (moveEvent.clientX > rightDockRect.left && moveEvent.clientX < rightDockRect.right && !windowElement.isDocked) {
                this.rightDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.rightDock.dock.classList.add("active");
            }

            // Condition 2: Undocking from Right Dock to Shadow DOM - Debug Event
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

            // **Top Dock Logic**
            // Condition 1: Docking from Shadow DOM to Top Dock - Debug Event
            if (moveEvent.clientY > topDockRect.top && moveEvent.clientY < topDockRect.bottom && !windowElement.isDocked) {
                this.topDock.dispatchEvent(
                    new CustomEvent("custom-drag-enter", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.topDock.dock.classList.add("active");
            }

            // Condition 2: Undocking from Top Dock to Shadow DOM - Debug Event
            else if (moveEvent.clientY >= topDockRect.bottom && windowElement.isDocked && windowElement.dockedTo === "top") {
                this.topDock.dispatchEvent(
                    new CustomEvent("custom-drag-leave", {
                        detail: { id },
                        bubbles: true,
                        composed: true,
                    })
                );
            }

            // Condition 3: Dragging a docked window within Top Dock
            else if (moveEvent.clientY <= topDockRect.bottom && windowElement.isDocked && windowElement.dockedTo === "top") {
                this.draggingWindow.style.position = "fixed";
            }
        };

        // Handle cleanup on mouseup
        const onMouseUp = (moveUpEvent) => {
            console.log(`Dragging ended for window with ID ${id}`);

            // Top Dock Drop Logic
            if (moveUpEvent.clientY < topDockRect.bottom && !windowElement.isDocked) {
                this.topDock.dockDrop(windowElement);
                windowElement.dockedTo = "top";
            }
            
                
            // Left Dock Drop Logic
            else if (moveUpEvent.clientX < leftDockRect.right && !windowElement.isDocked) {
                this.leftDock.dockDrop(windowElement);
                windowElement.dockedTo = "left";
            }
            
            // Right Dock Drop Logic
        
            else if (moveUpEvent.clientX > rightDockRect.left && !windowElement.isDocked) {
                this.rightDock.dockDrop(windowElement);
                windowElement.dockedTo = "right";
            }
                

            // Undocking from Left Dock
            else if (moveUpEvent.clientX >= leftDockRect.right && windowElement.isDocked && windowElement.dockedTo === "left") {
                this.leftDock.handleUndock(windowElement);
            }

            // Undocking from Right Dock
            else if (moveUpEvent.clientX <= rightDockRect.left && windowElement.isDocked && windowElement.dockedTo === "right") {
                this.rightDock.handleUndock(windowElement);
            }
            // Undocking from top Dock
            else if (moveUpEvent.clientY <= topDockRect.bottom && windowElement.isDocked && windowElement.dockedTo === "top") {
                this.topDock.handleUndock(windowElement);
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



