
export default class SGuiWindowBase extends HTMLElement {
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
        this.topBar = this.createTopBar();
        this.appendChild(this.topBar);
        this.contentDiv = document.createElement("div");
        this.appendChild(this.contentDiv);  
        this.appendChild = (element) => {
            this.contentDiv.appendChild(element);
        }
        this.removeChild = (element) => {
            this.contentDiv.removeChild(element);
        }
        this.removeAllChildren = () => {
            this.contentDiv.innerHTML = "";
        }
        this.append = (element) => {
            this.contentDiv.append(element);
        }
        // Attach event listeners for dragging
        this.attachDragListeners(this.topBar);

        if (!isOpen) {
            this.close()
        }
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
    closeTopBar(){
    }
    openTopBar(){
    }

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
        //this.parent.appendChild(this);
    }
}



