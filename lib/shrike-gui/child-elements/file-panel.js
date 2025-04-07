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
            type: "normal", // "normal" or "special"
        }
        this.options = { ...defaultOptions, ...customOptions }

        const filePanel = document.createElement("div");
        const fileList = document.createElement("ul");
        const heading = document.createElement("div");
        heading.style.userSelect = "none"
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
        placeholder.style.userSelect = "none"
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

        // Add event listener for update-files
        this.addEventListener("update-files", (e) => {
            console.log("update-files", e.detail.files)
            // Clear existing files
            this.options.files = [];
            fileList.innerHTML = '';
            
            // Add new files
            if (e.detail.files && e.detail.files.length > 0) {
                e.detail.files.forEach((file) => {
                    this.options.files.push(file);
                    
                    const fileElement = document.createElement("li");
                    fileElement.textContent = file.name;
                    fileElement.setAttribute("draggable", "true");
                    
                    const removeBtn = document.createElement("button");
                    removeBtn.textContent = "✖";
                    removeBtn.className = "remove-btn";
                    
                    removeBtn.addEventListener("click", () => {
                        const index = this.options.files.indexOf(file);
                        if (index > -1) {
                            this.options.files.splice(index, 1);
                        }
                        fileElement.remove();
                        if (this.options.files.length < 1) { 
                            placeholder.textContent = "Wow, such empty.";
                            heading.textContent = "";
                        }
                        console.log("File removed:", file.name);
                        updatePlaceholder();
                        
                        this.dispatchEvent(new CustomEvent("file-removed", {
                            detail: { file: file }
                        }));
                    });
                    
                    fileElement.appendChild(removeBtn);
                    fileList.appendChild(fileElement);
                });
            }
            
            updatePlaceholder();
        });

        filePanel.addEventListener("drop", (ev) => {
            console.log("File(s) dropped");
            ev.preventDefault();
        
            if (this.options.type === "special" && this.options.files.length >= 1) {
                return;
            }
        
            const files = ev.dataTransfer.items
                ? [...ev.dataTransfer.items]
                    .filter((item) => item.kind === "file")
                    .map((item) => item.getAsFile())
                : [...ev.dataTransfer.files];
        
            files.forEach((file, i) => {
                if (this.options.type === "special" && this.options.files.length >= 1) return;
        
                this.options.files.push(file);
        
                if (this.options.type === "special") {
                    this.dispatchEvent(new CustomEvent("special-file-drop", {
                        detail: { file: this.options.files[0], element: filePanel },
                    }));
                }
        
                const fileElement = document.createElement("li");
                fileElement.textContent = file.name;
                fileElement.setAttribute("draggable", "true");
        
                // Create and append the remove button
                const removeBtn = document.createElement("button");
                removeBtn.textContent = "✖";
                removeBtn.className = "remove-btn";
        
                removeBtn.addEventListener("click", () => {
                    // Remove file from the list and memory
                    const index = this.options.files.indexOf(file);
                    if (index > -1) {
                        this.options.files.splice(index, 1);
                    }
                    fileElement.remove();
                    if (this.options.files.length < 1) { 
                        placeholder.textContent = "Wow, such empty.";
                        heading.textContent = "";
                    }
                    console.log("File removed:", file.name);
                    updatePlaceholder();
                    
                    // Dispatch file-removed event
                    this.dispatchEvent(new CustomEvent("file-removed", {
                        detail: { file: file }
                    }));
                });
        
                fileElement.appendChild(removeBtn);
        
                fileElement.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", i);
                    const dataTransfer = e.dataTransfer;
                    dataTransfer.items.add(file);
                    fileElement.classList.add("dragging");
                    this.options.currentContext = file;
                    console.log("Context set to", this.options.currentContext);
                });
        
                fileElement.addEventListener("dragend", () => {
                    fileElement.classList.remove("dragging");
                });
        
                fileElement.addEventListener("click", () => {
                    this.options.currentContext = file;
                    console.log("Context set to", this.options.currentContext);
                });
        
                fileList.appendChild(fileElement);
        
                console.log(`… file[${i}].name = ${file.name}`);
            });
        
            updatePlaceholder();
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

