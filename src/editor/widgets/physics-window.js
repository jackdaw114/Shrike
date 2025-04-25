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
        mass: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 1 }),
        friction: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 0.3 }),
        restitution: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 0.3 }),
        bodyType: document.createElement('form'),

        // Collision shape properties
        shapeDropDown: new SGuiDropDown({ heading: "Collision Shape" }),
        shapeType: new SGuiDropDown({ heading: "Shape Type" }),
        boxSize: {
            x: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 1 }),
            y: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 1 }),
            z: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 1 })
        },
        sphereRadius: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 0.5 }),

        // World settings
        worldDropDown: new SGuiDropDown({ heading: "World Settings" }),
        gravity: {
            x: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 0 }),
            y: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: 0 }),
            z: new SGuiInputBox({ heading: "", type: "number", step: 0.1, content: -9.82 })
        }
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .physics-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 8px;
            padding: 8px;
        }
        .physics-input {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .physics-label {
            font-size: 0.8em;
            color: #888;
            text-align: center;
        }
        .physics-checkbox {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
        }
    `;
    physicsWindow.mainWindow.appendChild(style);

    // Create input grid helper function
    const createInputGrid = (heading, values) => {
        const container = document.createElement('div');
        container.className = 'physics-grid';

        Object.entries(values).forEach(([key, value]) => {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'physics-input';

            const label = document.createElement('div');
            label.className = 'physics-label';
            label.textContent = key.toUpperCase();

            inputContainer.appendChild(label);
            inputContainer.appendChild(value);
            container.appendChild(inputContainer);
        });

        return container;
    };

    // Setup physics body properties
    const setupBodyProperties = () => {
        const container = document.createElement('div');
        container.className = 'physics-grid';

        // Mass input
        const massContainer = document.createElement('div');
        massContainer.className = 'physics-input';
        const massLabel = document.createElement('div');
        massLabel.className = 'physics-label';
        massLabel.textContent = 'MASS';
        massContainer.appendChild(massLabel);
        massContainer.appendChild(physicsWindow.mass);
        container.appendChild(massContainer);

        // Friction input
        const frictionContainer = document.createElement('div');
        frictionContainer.className = 'physics-input';
        const frictionLabel = document.createElement('div');
        frictionLabel.className = 'physics-label';
        frictionLabel.textContent = 'FRICTION';
        frictionContainer.appendChild(frictionLabel);
        frictionContainer.appendChild(physicsWindow.friction);
        container.appendChild(frictionContainer);

        // Restitution input
        const restitutionContainer = document.createElement('div');
        restitutionContainer.className = 'physics-input';
        const restitutionLabel = document.createElement('div');
        restitutionLabel.className = 'physics-label';
        restitutionLabel.textContent = 'RESTITUTION';
        restitutionContainer.appendChild(restitutionLabel);
        restitutionContainer.appendChild(physicsWindow.restitution);
        container.appendChild(restitutionContainer);

        // Static checkbox
        const staticContainer = document.createElement('div');
        staticContainer.className = 'physics-checkbox';
        const types = [{
            type:CANNON.Body.STATIC,
            name: 'static',
        },{
            type:CANNON.Body.DYNAMIC,
            name: 'dynamic',
        },{
            type:CANNON.Body.KINEMATIC,
            name: 'kinematic',
        }
        ]

        types.forEach(entry => {
            const label = document.createElement('label');

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'type';
            radio.value = entry.type;

            label.appendChild(radio);
            label.append(`${entry.name}`);
                physicsWindow.bodyType.appendChild(label);
                physicsWindow.bodyType.appendChild(document.createElement('br'));
        });

        staticContainer.appendChild(physicsWindow.bodyType);
        container.appendChild(staticContainer);

        physicsWindow.bodyDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.bodyDropDown);
    };

    // Setup collision shape properties
    const setupShapeProperties = () => {
        const container = document.createElement('div');
        container.className = 'physics-grid';

        // Shape type dropdown
        const shapeTypes = ['Box', 'Sphere'];
        shapeTypes.forEach(type => {
            const option = document.createElement('div');
            option.textContent = type;
            option.onclick = () => {
                if (editor.activeObjects.length === 0) return
                physicsWindow.shapeType.setAttribute('heading', `Shape Type: ${type}`);
                const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody")
                console.log("physics body", physicsBody)
                if (type === 'Box') {
                    physicsBody.removeShape(physicsBody.body.shapes[0])
                    physicsBody.body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)))
                }
                if (type === 'Sphere') {
                    physicsBody.removeShape(physicsBody.body.shapes[0])
                    physicsBody.body.addShape(new CANNON.Sphere(1))
                }


                updateShapeInputs(type);
            };
            physicsWindow.shapeType.appendChild(option);
        });

        container.appendChild(physicsWindow.shapeType);

        // Box size inputs
        const boxContainer = createInputGrid("Box Size", physicsWindow.boxSize);
        boxContainer.style.display = 'none';
        physicsWindow.boxContainer = boxContainer;

        // Sphere radius input
        const sphereContainer = document.createElement('div');
        sphereContainer.className = 'physics-grid';
        const sphereInputContainer = document.createElement('div');
        sphereInputContainer.className = 'physics-input';
        const sphereLabel = document.createElement('div');
        sphereLabel.className = 'physics-label';
        sphereLabel.textContent = 'RADIUS';
        sphereInputContainer.appendChild(sphereLabel);
        sphereInputContainer.appendChild(physicsWindow.sphereRadius);
        sphereContainer.appendChild(sphereInputContainer);
        sphereContainer.style.display = 'none';
        physicsWindow.sphereContainer = sphereContainer;

        container.appendChild(boxContainer);
        container.appendChild(sphereContainer);

        physicsWindow.shapeDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.shapeDropDown);
    };

    // Setup world settings
    const setupWorldSettings = () => {
        const container = createInputGrid("Gravity", physicsWindow.gravity);
        physicsWindow.worldDropDown.appendChild(container);
        physicsWindow.mainWindow.appendChild(physicsWindow.worldDropDown);
    };
    // Helper function to update shape inputs visibility
    const updateShapeInputs = (type) => {
        if (physicsWindow.boxContainer) {
            physicsWindow.boxContainer.style.display = type === 'Box' ? 'block' : 'none';
            if (type === 'Box') {
                const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody")
                physicsBody.body.updateBoundingRadius()
            }
        }
        if (physicsWindow.sphereContainer) {
            physicsWindow.sphereContainer.style.display = type === 'Sphere' ? 'block' : 'none';
            if (type === 'Sphere') {
                const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody")
                // physicsBody.removeShape(physicsBody.body.shapes[0])
                // physicsBody.body.addShape(new CANNON.Sphere(1))
                physicsBody.body.updateBoundingRadius()
            }
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
        console.log("physics body", physicsBody)
        if (physicsBody) {
            console.log("Physics body changed", physicsBody.body)
            console.log("mass changed", e.target.value)
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

    physicsWindow.bodyType.addEventListener('change', (e) => {
        if (editor.activeObjects.length === 0) return;
        const physicsBody = editor.activeObjects[0].getComponent("PhysicsBody");
        if (physicsBody) {
            console.log(e.target.value)
            physicsBody.body.type = e.target.value;
            physicsBody.body.updateMassProperties();
            // console.log(physicsBody.body.type)
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
        console.log("current radius", physicsBody.body.shapes[0].radius)
        console.log("new radius", e.target.value)
        if (physicsBody && physicsBody.body.shapes[0] instanceof CANNON.Sphere) {
            const newRadius = parseFloat(e.target.value);
            physicsBody.removeShape(physicsBody.body.shapes[0]);
            const newShape = new CANNON.Sphere(newRadius);
            physicsBody.body.addShape(newShape);
            physicsBody.body.updateBoundingRadius();
            console.log("new radius", newShape.radius, physicsBody.body.shapes[0])
            console.log('HLSDFJ:LFAJL:AFJLJ', editor.activeObjects[0].getComponent("PhysicsBody"))
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
                physicsWindow.bodyType.type.value = physicsBody.body.type

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
        console.log("set active object", editor.activeObjects[0].getComponent("PhysicsBody"))
        physicsWindow.updateActivePhysics();
    });

    return physicsWindow;
}; 