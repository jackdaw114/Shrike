import SGuiButton from "../../../lib/shrike-gui/child-elements/button";
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";

export const createEntitySerializationWindow = (editor, sgui) => {
    const serializationWindow = {
        mainWindow: sgui.createWindow("Entity Serialization", true),
        
        // File operations
        fileDropDown: new SGuiDropDown({ heading: "File Operations" }),
        saveButton: new SGuiButton(document,{ text: "Save Entities" }),
        loadButton: new SGuiButton(document,{ text: "Load Entities" }),
        
        // Entity selection
        entityDropDown: new SGuiDropDown({ heading: "Entity Selection" }),
        selectedEntity: new SGuiDropDown({ heading: "Select Entity" }),
        
        // Component selection
        componentDropDown: new SGuiDropDown({ heading: "Component Selection" }),
        selectedComponents: new SGuiDropDown({ heading: "Select Components" })
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .serialization-window {
            display: flex;
            flex-direction: column;
            gap: 12px;
            background-color: #1a222b;
        }
        .input-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            background-color: #212730;
            border-radius: 4px;
        }
        .button-container {
            display: flex;
            gap: 8px;
            padding: 8px;
        }
    `;
    serializationWindow.mainWindow.appendChild(style);
    serializationWindow.mainWindow.classList.add('serialization-window');

    // Setup file operations
    const setupFileOperations = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        buttonContainer.appendChild(serializationWindow.saveButton);
        buttonContainer.appendChild(serializationWindow.loadButton);
        
        container.appendChild(buttonContainer);
        serializationWindow.fileDropDown.appendChild(container);
        serializationWindow.mainWindow.appendChild(serializationWindow.fileDropDown);
    };

    // Setup entity selection
    const setupEntitySelection = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        container.appendChild(serializationWindow.selectedEntity);
        serializationWindow.entityDropDown.appendChild(container);
        serializationWindow.mainWindow.appendChild(serializationWindow.entityDropDown);
    };

    // Setup component selection
    const setupComponentSelection = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        container.appendChild(serializationWindow.selectedComponents);
        serializationWindow.componentDropDown.appendChild(container);
        serializationWindow.mainWindow.appendChild(serializationWindow.componentDropDown);
    };

    // Initialize all sections
    setupFileOperations();
    setupEntitySelection();
    setupComponentSelection();

    // Add event listeners for file operations
    serializationWindow.saveButton.addEventListener('click', async () => {
        const filename = `entities_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        await editor.engine.saveEntitiesToFile(filename,editor.gameScene);
    });

    serializationWindow.loadButton.addEventListener('click', () => {
        editor.gameScene.stop();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                editor.file = file
                await editor.engine.loadEntitiesFromFile(file, editor.gameScene);
                updateEntityList();
                editor.gameScene.forceReload();
                document.dispatchEvent(new Event("reload-scene",{bubbles:true}))
                editor.gameScene.start([editor.gameRenderer,editor.debugSystem,editor.cannonRenderer]);
            }
        };
        
        input.click();
    });

    // Update entity list
    const updateEntityList = () => {
        serializationWindow.selectedEntity.innerHTML = '';
        const entities = editor.engine.entities.filter(e => e !== null);

        entities.forEach(entity => {
            const option = document.createElement('div');
            option.textContent = entity.name;
            option.onclick = () => {
                serializationWindow.selectedEntity.setAttribute('heading', `Selected Entity: ${entity.name}`);
                updateComponentList(entity);
            };
            serializationWindow.selectedEntity.appendChild(option);
        });
    };

    // Update component list for selected entity
    const updateComponentList = (entity) => {
        serializationWindow.selectedComponents.innerHTML = '';
        entity.components.forEach(component => {
            const option = document.createElement('div');
            option.textContent = component.constructor.name;
            serializationWindow.selectedComponents.appendChild(option);
        });
    };

    // Add update method to refresh UI when entities change
    serializationWindow.updateEntityList = () => {
        updateEntityList();
    };

    // Listen for entity changes
    document.addEventListener("entity-changed", () => {
        serializationWindow.updateEntityList();
    });

    // Initial update
    serializationWindow.updateEntityList();

    return serializationWindow;
}; 