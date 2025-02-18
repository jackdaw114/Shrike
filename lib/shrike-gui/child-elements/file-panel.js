export default class SGuiFilePanel extends HTMLElement {
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

                    reader.onload = (event) => {
                        console.log("File content:", event.target.result);

                        e.target.dispatchEvent(new CustomEvent("file-drop",
                            {
                                detail: {
                                    file: this.options.currentContext,
                                    content: event.target.result,
                                },
                                bubbles: true,
                                composed: true,
                            }
                        ))
                    };

                    reader.onerror = (error) => {
                        console.error("Error reading file:", error);
                    };

                    reader.readAsText(this.options.currentContext);
                    
                    console.log("hello")
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

