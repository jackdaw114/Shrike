import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiInputBox from "../../../lib/shrike-gui/child-elements/input-box";
import SGuiSlider from "../../../lib/shrike-gui/child-elements/slider";
import SGuiCheckbox from "../../../lib/shrike-gui/child-elements/checkbox";
import CANNON from "cannon";
export const createPhysicsWindow = (editor, sgui) => {
    const physicsWindow = {
        mainWindow: sgui.createWindow("Physics", true),
        
        // Physics body properties
        bodyDropDown: new SGuiDropDown({ heading: "Physics Body" }),
        mass: new SGuiInputBox({ heading: "Mass:", type: "number", step: 0.1, content: 1 }),
        friction: new SGuiInputBox({ heading: "Friction:", type: "number", step: 0.1, content: 0.3 }),
        restitution: new SGuiInputBox({ heading: "Restitution:", type: "number", step: 0.1, content: 0.3 }),
        isStatic: new SGuiCheckbox({ heading: "Static Body" }),
        
        // Collision shape properties
        shapeDropDown: new SGuiDropDown({ heading: "Collision Shape" }),
        shapeType: new SGuiDropDown({ heading: "Shape Type" }),
        boxSize: {
            x: new SGuiInputBox({ heading: "Width:", type: "number", step: 0.1, content: 1 }),
            y: new SGuiInputBox({ heading: "Height:", type: "number", step: 0.1, content: 1 }),
            z: new SGuiInputBox({ heading: "Depth:", type: "number", step: 0.1, content: 1 })
        },
        sphereRadius: new SGuiInputBox({ heading: "Radius:", type: "number", step: 0.1, content: 0.5 }),
        
        // World settings
        worldDropDown: new SGuiDropDown({ heading: "World Settings" }),
        gravity: {
            x: new SGuiInputBox({ heading: "Gravity X:", type: "number", step: 0.1, content: 0 }),
            y: new SGuiInputBox({ heading: "Gravity Y:", type: "number", step: 0.1, content: 0 }),
            z: new SGuiInputBox({ heading: "Gravity Z:", type: "number", step: 0.1, content: -9.82 })
        }
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .physics-window {
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
    `;
    physicsWindow.mainWindow.appendChild(style);
    physicsWindow.mainWindow.classList.add('physics-window');

    // Setup physics body properties
    const setupBodyProperties = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        container.appendChild(physicsWindow.mass);
        container.appendChild(physicsWindow.friction);
        container.appendChild(physicsWindow.restitution);
        container.appendChild(physicsWindow.isStatic);
        
        physicsWindow.bodyDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.bodyDropDown);
    };

    // Setup collision shape properties
    const setupShapeProperties = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        // Shape type dropdown
        const shapeTypes = ['Box', 'Sphere'];
        shapeTypes.forEach(type => {
            const option = document.createElement('div');
            option.textContent = type;
            option.onclick = () => {
                physicsWindow.shapeType.setAttribute('heading', `Shape Type: ${type}`);
                updateShapeInputs(type);
            };
            physicsWindow.shapeType.appendChild(option);
        });
        
        container.appendChild(physicsWindow.shapeType);
        
        // Box size inputs
        const boxContainer = document.createElement('div');
        boxContainer.className = 'input-container';
        boxContainer.appendChild(physicsWindow.boxSize.x);
        boxContainer.appendChild(physicsWindow.boxSize.y);
        boxContainer.appendChild(physicsWindow.boxSize.z);
        boxContainer.style.display = 'none';
        physicsWindow.boxContainer = boxContainer;
        
        // Sphere radius input
        const sphereContainer = document.createElement('div');
        sphereContainer.className = 'input-container';
        sphereContainer.appendChild(physicsWindow.sphereRadius);
        sphereContainer.style.display = 'none';
        physicsWindow.sphereContainer = sphereContainer;
        
        container.appendChild(boxContainer);
        container.appendChild(sphereContainer);
        
        physicsWindow.shapeDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.shapeDropDown);
    };

    // Setup world settings
    const setupWorldSettings = () => {
        const container = document.createElement('div');
        container.className = 'input-container';
        
        container.appendChild(physicsWindow.gravity.x);
        container.appendChild(physicsWindow.gravity.y);
        container.appendChild(physicsWindow.gravity.z);
        
        physicsWindow.worldDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.worldDropDown);
    };

    // Helper function to update shape inputs visibility
    const updateShapeInputs = (type) => {
        if (physicsWindow.boxContainer) {
            physicsWindow.boxContainer.style.display = type === 'Box' ? 'block' : 'none';
        }
        if (physicsWindow.sphereContainer) {
            physicsWindow.sphereContainer.style.display = type === 'Sphere' ? 'block' : 'none';
        }
    };

    // Initialize all sections
    setupBodyProperties();
    setupShapeProperties();
    setupWorldSettings();

    // Add event listeners for physics body properties
    physicsWindow.mass.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        console.log("physics body",physicsBody)
        if (physicsBody) {
            console.log("Physics body changed",physicsBody.body)
            console.log("mass changed",e.target.value)
            physicsBody.body.mass = parseFloat(e.target.value);
            physicsBody.body.updateMassProperties();
        }
    });

    physicsWindow.friction.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        
        if (physicsBody) {
            physicsBody.body.material.friction = parseFloat(e.target.value);
        }
    });

    physicsWindow.restitution.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody) {
            physicsBody.body.material.restitution = parseFloat(e.target.value);
        }
    });

    physicsWindow.isStatic.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody) {
            physicsBody.body.type = e.target.checked ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC;
        }
    });

    // Add event listeners for world settings
    physicsWindow.gravity.x.addEventListener('change', (e) => {
        const physicsSystem = editor.cannonPhysicsSystem;
        
        if (physicsSystem) {
            physicsSystem.world.gravity.x = parseFloat(e.target.value);
        }
    });

    physicsWindow.gravity.y.addEventListener('change', (e) => {
        const physicsSystem = editor.cannonPhysicsSystem;
        console.log(physicsSystem)
        if (physicsSystem) {
            physicsSystem.world.gravity.y = parseFloat(e.target.value);
        }
    });

    physicsWindow.gravity.z.addEventListener('change', (e) => {
        const physicsSystem = editor.cannonPhysicsSystem;
        if (physicsSystem) {
            physicsSystem.world.gravity.z = parseFloat(e.target.value);
        }
    });

    // Add event listeners for shape properties
    physicsWindow.boxSize.x.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody && physicsBody.body.shapes[0] instanceof CANNON.Box) {
            const halfExtents = physicsBody.body.shapes[0].halfExtents;
            const newHalfExtents = new CANNON.Vec3(
                parseFloat(e.target.value) / 2,
                halfExtents.y,
                halfExtents.z
            );
            physicsBody.removeShape(physicsBody.body.shapes[0]);
            const newShape = new CANNON.Box(newHalfExtents);
            physicsBody.body.addShape(newShape);
            physicsBody.body.updateBoundingRadius();
        }
    });

    physicsWindow.boxSize.y.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody && physicsBody.body.shapes[0] instanceof CANNON.Box) {
            const halfExtents = physicsBody.body.shapes[0].halfExtents;
            const newHalfExtents = new CANNON.Vec3(
                halfExtents.x,
                parseFloat(e.target.value) / 2,
                halfExtents.z
            );
            physicsBody.removeShape(physicsBody.body.shapes[0]);
            const newShape = new CANNON.Box(newHalfExtents);
            physicsBody.body.addShape(newShape);
            physicsBody.body.updateBoundingRadius();
        }
    });

    physicsWindow.boxSize.z.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody && physicsBody.body.shapes[0] instanceof CANNON.Box) {
            const halfExtents = physicsBody.body.shapes[0].halfExtents;
            const newHalfExtents = new CANNON.Vec3(
                halfExtents.x,
                halfExtents.y,
                parseFloat(e.target.value) / 2
            );
            physicsBody.removeShape(physicsBody.body.shapes[0]);
            const newShape = new CANNON.Box(newHalfExtents);
            physicsBody.body.addShape(newShape);
            physicsBody.body.updateBoundingRadius();
        }
    });

    physicsWindow.sphereRadius.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody && physicsBody.body.shapes[0] instanceof CANNON.Sphere) {
            const newRadius = parseFloat(e.target.value);
            physicsBody.removeShape(physicsBody.body.shapes[0]);
            const newShape = new CANNON.Sphere(newRadius);
            physicsBody.body.addShape(newShape);
            physicsBody.body.updateBoundingRadius();
        }
    });

    // Add update method to refresh UI when active object changes
    physicsWindow.updateActivePhysics = () => {
        if (editor.activeObjects.length === 1) {
            const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
            if (physicsBody) {
                physicsWindow.mass.setValue(physicsBody.body.mass);
                physicsWindow.friction.setValue(physicsBody.body.material.friction);
                physicsWindow.restitution.setValue(physicsBody.body.material.restitution);
                physicsWindow.isStatic.setChecked(physicsBody.body.type === CANNON.Body.STATIC);
                
                // Update shape properties based on shape type
                if (physicsBody.body.shapes[0] instanceof CANNON.Box) {
                    physicsWindow.shapeType.setAttribute('heading', 'Shape Type: Box');
                    const halfExtents = physicsBody.body.shapes[0].halfExtents;
                    physicsWindow.boxSize.x.setValue(halfExtents.x * 2);
                    physicsWindow.boxSize.y.setValue(halfExtents.y * 2);
                    physicsWindow.boxSize.z.setValue(halfExtents.z * 2);
                    updateShapeInputs('Box');
                } else if (physicsBody.body.shapes[0] instanceof CANNON.Sphere) {
                    physicsWindow.shapeType.setAttribute('heading', 'Shape Type: Sphere');
                    physicsWindow.sphereRadius.setValue(physicsBody.body.shapes[0].radius);
                    updateShapeInputs('Sphere');
                }
            }
        }
    };

    // Listen for active object changes
    document.addEventListener("set-active-object", () => {
        physicsWindow.updateActivePhysics();
    });

    return physicsWindow;
}; 