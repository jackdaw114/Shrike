import SGuiButton from "../../../lib/shrike-gui/child-elements/button";
import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiList from "../../../lib/shrike-gui/child-elements/list";
import SGuiText from "../../../lib/shrike-gui/child-elements/text";
import { Shrike } from "../../core/core";
import {Transformation} from "../../ecs/classes";
import {Geometry, Script} from "../../ecs/component-classes";
import { PhysicsBody } from "../../ecs/component-classes/physics-body";
import CANNON from "cannon";

/**
 *
 * @param {*} element
 * @param {Shrike} engine
 * @param {*} sgui
 * @returns
 */
export const createSceneGraphWindow = (element, engine, sgui, scene) => {
    const sceneGraphWindow = {};
    const sceneGraph = {};
    sceneGraphWindow.mainWindow = sgui.createWindow("Scene", true);
    sceneGraphWindow.ribbon = document.createElement("div");
    sceneGraphWindow.entities = []
    sceneGraphWindow.ribbon.addObjectButton = new SGuiButton(
        sceneGraphWindow.mainWindow
    );
    sceneGraphWindow.ribbon.appendChild(
        sceneGraphWindow.ribbon.addObjectButton
    );
    sceneGraphWindow.listRoot = new SGuiList();
    
    for (const key of Object.keys(sceneGraphWindow)) {
        if (key == "mainWindow" || key == "entities") continue;
        sceneGraphWindow.mainWindow.appendChild(sceneGraphWindow[key]);
    }
    const selectionWindow = createSelectionWindow(sgui)
    const addObject = () => {
        selectionWindow.open() // some sort of context optinos ig here 
        selectionWindow.context = sceneGraphWindow.mainWindow
    };

    sceneGraphWindow.ribbon.addObjectButton.onclick = (e) => {
        addObject()
    };

    sceneGraphWindow.mainWindow.addEventListener("selected", e => {
        console.log(e.detail)
        switch (e.detail.name) {
            case "node":
                const entity = engine.createEntity(scene)
                console.log(entity)
                sceneGraphWindow.entities.push({
                    entity: entity,
                    name:e.detail.name
                })
                updateSceneGraphWindow(sceneGraphWindow,selectionWindow,scene)
                break;
        }
    })

    return {
        window: sceneGraphWindow,
        sceneGraph: sceneGraph,
        addObject: addObject,
    };
};

function createSelectionWindow(sgui) {
    const selectionWindow = sgui.createWindow("Add Object", false);
    selectionWindow.context = null

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .selection-window {
            background-color:rgb(0, 0, 0);
        }
        .selection-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
            padding: 8px;
            list-style-type: none;
        }
        .selection-button {
            background-color: #212730;
            border: 1px solid #2a3441;
            border-radius: 4px;
            padding: 8px 12px;
            color: #e0e0e0;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
            font-size: 0.9em;
            transform-origin: center;
            position: relative;
            overflow: hidden;
        }
        .selection-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        .selection-button:hover {
            background-color: #2a3441;
            border-color: #3a4a5a;
            transform: scale(1.02);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .selection-button:hover::before {
            transform: translateX(100%);
        }
        .selection-button:active {
            background-color: #3a4a5a;
            transform: scale(0.98);
            transition: all 0.1s ease;
        }
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(58, 74, 90, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(58, 74, 90, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(58, 74, 90, 0);
            }
        }
        .selection-button:focus {
            animation: pulse 1.5s infinite;
            outline: none;
        }
    `;
    selectionWindow.appendChild(style);
    selectionWindow.classList.add('selection-window');

    const tempList = [
        {
            name: "Node",
            func: () => {}
        },
        {
            name: "Geometry",
            func: () => {}
        },
        {
            name: "Script",
            func: () => {}
        },
        
        {
            name: "Physics Body",
            func: () => {}
        }
    ];
    const list = new SGuiList() 
    list.classList.add('selection-list');
    tempList.forEach(item=>{
        const button = document.createElement("button")
        button.innerHTML = item.name
        button.classList.add('selection-button');

        button.onclick = (e) => {
            item.func() 
            selectionWindow.context?.dispatchEvent(new CustomEvent("selected",{
                detail:{
                    ...item
                }
            }))
            selectionWindow.close()
        }
        list.appendChild(button)
    })
    selectionWindow.appendChild(list)
    return selectionWindow
}

function updateSceneGraphWindow(sceneGraphWindow, selectionWindow, scene) {
    sceneGraphWindow.listRoot.innerHTML = ""  // TODO: check if events are being discarded here
    for (const entity of sceneGraphWindow.entities) {
        const dropDown = new SGuiDropDown({heading:entity.entity.name}) 
        sceneGraphWindow.listRoot.appendChild(dropDown)
        dropDown.contentDiv.innerHTML = ""
        dropDown.entity = entity.entity
        let update = () => {
            dropDown.contentDiv.innerHTML = ""
            for (const component in entity.entity.components){
                const entry = new SGuiText({text:component})
                entry.className = `component-entry ${component}`
                dropDown.appendChild(entry)
                entry.ondblclick = (e) => {
                    document.dispatchEvent(new CustomEvent("set-active-object",{
                        detail: {
                            entity:dropDown.entity
                        }
                    }))
                }
            }
        }
        update()
        dropDown.toggleDiv.ondblclick = () => {
            selectionWindow.open()
            selectionWindow.context = dropDown 
        }
        console.log(entity.entity.components)
        dropDown.addEventListener("selected", e => {
            switch (e.detail.name) {
                case "Geometry": //edge case issues
                    if (dropDown.geometry) break;
                    const geometry = new Geometry(
                        [],[]
                    )
                    const transformation = new Transformation()
                    dropDown.geometry = geometry 
                    scene.addComponent(entity.entity,geometry)
                    if(!entity.entity.components.Transformation)
                    scene.addComponent(entity.entity,transformation)
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
                case "Physics Body":
                    const body = new PhysicsBody({
                        mass: 1,
                        position: new CANNON.Vec3(0, 0, 0),
                        shape: new CANNON.Sphere(1),
                        material: new CANNON.Material("physicsMaterial"),
                        linearDamping: 0.01,
                        angularDamping: 0.01
                    });
                    scene.addComponent(entity.entity, body);
                    if(!entity.entity.components.Transformation)
                        scene.addComponent(entity.entity, new Transformation());
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
                case "Script":
                    if (dropDown.script) break;
                    const script = new Script(
                        [],[]
                    )
                    dropDown.script = script 
                    scene.addComponent(entity.entity,script)  
                    update()
                    document.dispatchEvent(new CustomEvent("refresh-properties",{
                        detail: {
                            entity: entity.entity
                        }
                    }))
                    break;
            } 
        })
    }
}

// Add CSS styles for component entries
const componentStyle = document.createElement('style');
componentStyle.textContent = `
    .component-entry {
        background-color: #212730;
        border: 1px solid #2a3441;
        border-radius: 4px;
        padding: 8px 12px;
        color: #e0e0e0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        font-size: 0.9em;
        transform-origin: center;
        position: relative;
        overflow: hidden;
        margin: 4px 0;
    }
    .component-entry::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
    }
    .component-entry:hover {
        background-color: #2a3441;
        border-color: #3a4a5a;
        transform: scale(1.02);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .component-entry:hover::before {
        transform: translateX(100%);
    }
    .component-entry:active {
        background-color: #3a4a5a;
        transform: scale(0.98);
        transition: all 0.1s ease;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(58, 74, 90, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(58, 74, 90, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(58, 74, 90, 0);
        }
    }
    .component-entry:focus {
        animation: pulse 1.5s infinite;
        outline: none;
    }
`;

// Add the style to the document
document.head.appendChild(componentStyle);
