export default class SGuiDock extends HTMLElement {
    constructor(side, shadowRoot) {
        super();
        this.shadowRootElem = shadowRoot;
        this.side = side;
        this.dockContents = [];

        const dock = document.createElement("div");
        this.dock = dock;

        dock.classList.add("docking-zone-overlay", `${this.side}-dock`);

        // create and attach resize handle
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("resize-handle", `${this.side}-handle`);

        // attach event listeners to dock element
        this.addEventListeners();

        // call fn to attach functionality to resize handle
        this.makeResizable(dock, resizeHandle, this.side);


        dock.appendChild(resizeHandle);
        this.appendChild(dock);
        this.shadowRootElem.appendChild(this);
    }
    connectedCallback() {
        // Adjust height for left and right docks if top dock is present
        if (this.side === "left" || this.side === "right") {
            this.adjustHeight();
        }
    }

    adjustHeight() {
        const topDock = this.shadowRootElem.querySelector(".top-dock");
        if (topDock) {
            const topDockRect = topDock.getBoundingClientRect();
            this.dock.style.height = `calc(100% - ${topDockRect.height}px)`;
            this.dock.style.top = `${topDockRect.bottom}px`;
        }
    }

    getBoundingClientRect() {
        return this.dock.getBoundingClientRect();
    }

    addEventListeners() {
        this.addEventListener(
            "custom-drag-enter",
            this.handleWindowDragEnter.bind(this)
        );

        this.addEventListener(
            "custom-drag-leave",
            this.handleWindowDragLeave.bind(this)
        );
    }

    handleWindowDragEnter(e) {
        console.log("dragEnter");
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

    dockDrop = (windowElement) => {
        if (windowElement) {
            if (!windowElement.isDocked) {
                if (this.dockContents.length === 0) {

                    const ulElement = document.createElement("ul");
                    ulElement.classList.add("unstyled-list"); // Add class to remove styles
                    this.dock.appendChild(ulElement);
                }

                // Add the window element to the dockContents array
                this.dockContents.push(windowElement);
                try {
                    this.shadowRootElem.removeChild(windowElement);
                } catch (e) {
                    console.error("Tried to remove window from shadowRoot even though it isnt a child of it. Parent is: ", windowElement.parentElement)
                }
                windowElement.parent = this.dock;

                // Create a new list item for the window
                const liElement = document.createElement("li");
                liElement.classList.add("unstyled-item"); // Add class to remove styles
                liElement.appendChild(windowElement); // Append windowElement as the content of the list item

                // Append this list item as the first child of the <ul>
                const ul = this.dock.querySelector("ul");
                ul.appendChild(liElement);

                // Resize the dock to match the window's height
                this.dock.style.height = `${windowElement.offsetHeight + 5}px`;



                windowElement.style.position = "static";
                windowElement.style.margin = "0"; // Reset any unintended margins
                windowElement.isDocked = true;
                this.dock.classList.add("docked");
                this.dock.classList.remove("active");
                // Set all windows in the dock to same width:
                if (this.side === "top" || this.side === "bottom") {
                    for (const window of this.dockContents) {
                        window.style.height = `${windowElement.offsetHeight}px`
                    }
                }
                else {
                    for (const window of this.dockContents) {
                        window.style.width = `${windowElement.offsetWidth}px`
                    }
                }
            }
        } else {
            console.log("Nothing to dock!")
        }
    }

    handleUndock = (windowElement, close = false) => {
        if (windowElement) {
            windowElement.isDocked = false; // Un-dock the window
            if (this.dockContents.length === 1) {
                console.log(this.dockContents.length - 1 + " elements")
                // Clear the contents of the left dock, preserving the resize handle
                while (this.dock.firstChild) {
                    if (!this.dock.firstChild.classList.contains("resize-handle")) {
                        this.dock.removeChild(this.dock.firstChild);
                    } else {
                        // Skip the resize handle
                        break;
                    }
                }

                this.dock.classList.remove("docked");
                if (this.side === "top" || this.side === "bottom") {
                    this.dock.style.height = 100 + "px";
                }
                else {
                    this.dock.style.width = 160 + "px";
                }

            } else { console.log("Dock Contents: ", this.dockContents.length) }

            const index = this.dockContents.indexOf(windowElement);
            if (index !== -1) {
                this.dockContents.splice(index, 1); // Remove the window from the dock list
            }

            // if (!close) {

            // Add the window back to the shadowRoot
            this.shadowRootElem.appendChild(windowElement);
            windowElement.parent = this.shadowRootElem;
            windowElement.style.position = "fixed";
            // }

        } else {
            console.log("Nothing to undock!")
        }
    }



    makeResizable(dock, handle, direction) {
        handle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.body.style.cursor =
                direction === "left" || direction === "right" ? "col-resize" : "row-resize";

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = dock.getBoundingClientRect().width;
            const startHeight = dock.getBoundingClientRect().height;

            const resize = (e) => {
                let newWidth = startWidth;
                let newHeight = startHeight;

                if (direction === "left") {
                    const deltaX = e.clientX - startX;
                    newWidth = startWidth + deltaX;
                } else if (direction === "right") {
                    const deltaX = e.clientX - startX;
                    newWidth = startWidth - deltaX;
                } else if (direction === "top") {
                    const deltaY = e.clientY - startY;
                    newHeight = startHeight + deltaY;
                } else if (direction === "bottom") {
                    const deltaY = e.clientY - startY;
                    newHeight = startHeight - deltaY;
                }

                // Set min/max limits
                if (newWidth >= 100 && newWidth <= 500 && (direction === "left" || direction === "right")) {
                    dock.style.width = `${newWidth}px`;
                }
                if (newHeight >= 100 && newHeight <= 500 && (direction === "top" || direction === "bottom")) {
                    dock.style.height = `${newHeight}px`;
                }

                // Adjust height for left and right docks if top dock is resized
                if (direction === "top") {
                    const leftDock = this.shadowRootElem.querySelector(".left-dock");
                    const rightDock = this.shadowRootElem.querySelector(".right-dock");
                    if (leftDock) {
                        leftDock.style.height = `calc(100% - ${newHeight}px)`;
                    }
                    if (rightDock) {
                        rightDock.style.height = `calc(100% - ${newHeight}px)`;
                    }
                }
            };

            const stopResize = () => {
                document.removeEventListener("mousemove", resize);
                document.removeEventListener("mouseup", stopResize);
                document.body.style.cursor = "default";
            };

            document.addEventListener("mousemove", resize);
            document.addEventListener("mouseup", stopResize);
        });
    }




}