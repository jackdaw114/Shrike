import { Shrike } from "../core/core";
import { parseOBJ } from "../../lib/parse-obj";
import { DebugLine, Geometry, Script } from "../ecs/component-classes";
import { Transformation } from "../ecs/classes";
import { EventHandler } from "../event-handler/event-handler";
import { DebugSystem } from "../gpu/debug-graphics/debug-helper";
import { Renderer } from "../gpu/renderer/renderer";
import { ScriptSystem } from "../script-system/script-system";
import { PickingSystem } from "../gpu/picker/picker";
import { CannonRenderer } from "../gpu/cannon-renderer/cannon-renderer";
import { CannonPhysicsSystem } from "../physics/cannon-physics-system";
import { SGui } from "../../lib/shrike-gui/sgui";
import SGuiColorPicker from "../../lib/shrike-gui/child-elements/color-picker";
import SGuiText from "../../lib/shrike-gui/child-elements/text";
import SGuiContainer from "../../lib/shrike-gui/child-elements/container";
import SGuiSlider from "../../lib/shrike-gui/child-elements/slider";
import SGuiInputBox from "../../lib/shrike-gui/child-elements/input-box";
import { createResourceWindow } from "./widgets/resourceWindow";
import { createMenuBar } from "./widgets/menuBar";
import { createEditorGizmos } from "./editor-overlay/gizmos";
import Camera from "../ecs/camera";
import { createTransformationWindow } from "./widgets/transformation-window";
import {createSceneGraphWindow} from "./widgets/scene-graph";
import {createPropertiesWindow} from "./widgets/properties-window";
import { createMaterialWindow } from "./widgets/material-window";
import { createPhysicsWindow } from "./widgets/physics-window";
import { createEntitySerializationWindow } from "./widgets/entity-serialization-window";
import { PhysicsSystem } from "../physics/physics-system";

export class Editor {
    activeObjects = [];
    engine;
    cannonMaxSubSteps = 5;
    isNavigating = false;
    gizmos = null;
    eventHandler;
    isGameRunning = false;

    constructor(canvas, gameSpeed, width, height) {
        this.canvas = canvas;
        this.context = canvas.getContext("webgl2");
        this.width = width;
        this.height = height;
        this.gameSpeed = gameSpeed;
        this.engine = new Shrike(canvas, width, height);
        this.editorOverlays = {};
        this.eventHandler = new EventHandler(canvas);
        this.initSystems();
        this.initEditor();
        this.editorCameraSetup();
        this.sguiSetup();
        this.initWidgets();
        this.initEventListeners();
    }

    async init() {
        this.gizmos = await createEditorGizmos(this.engine, this, this.editorScene);
        this.propertiesWindow = createPropertiesWindow(this.SGui,this.activeObjects,this.gameScene,this.gameRenderer)
        this.materialWindow = createMaterialWindow(this,this.SGui,this.canvas)
        this.physicsWindow = createPhysicsWindow(this, this.SGui)
        this.entitySerializationWindow = createEntitySerializationWindow(this, this.SGui)
    }

    initSystems() {
        const width = this.width;
        const height = this.height;
        const gameSpeed = this.gameSpeed;
        this.editorScene = this.engine.createScene(width,height);
        this.editorGizmoRenderer = this.engine.createSystem(
            Renderer,
            this.editorScene,
            this.context,
            width / height,
            width,
            height
        );

        this.editorOverlays.editorGizmoRenderer = {
            active: true,
        };
        this.gameScene = this.engine.createScene(width,height);
        this.gameRenderer = this.engine.createSystem(
            Renderer,
            this.gameScene,
            this.context,
            width / height,
            width,
            height
        );
        this.engine.activateScene(this.gameScene);
        this.engine.activateScene(this.editorScene);

        this.cannonPhysicsSystem = this.engine.createSystem(
            PhysicsSystem,
            this.gameScene,
            gameSpeed,
            3,
            {},
            this.cannonMaxSubSteps
        );
        this.cannonRenderer = this.engine.createSystem(
            CannonRenderer,
            this.gameScene,
            this.context,
            this.gameRenderer.framebuffer,
            this.cannonPhysicsSystem,
            width / height,
            width,
            height
        );
        this.scriptSystem = this.engine.createSystem(
            ScriptSystem,
            this.gameScene,
            this.eventHandler
        );
        this.editorScriptSystem = this.engine.createSystem(
            ScriptSystem,
            this.editorScene,
            this.eventHandler
        );
        this.gameScenePickingSystem = this.engine.createSystem(
            PickingSystem,
            this.gameScene,
            this.canvas,
            this.context,
            width,
            height
        );

        this.editorPickingSystem = this.engine.createSystem(
            PickingSystem,
            this.editorScene,
            this.canvas,
            this.context,
            width,
            height
        );
        this.debugSystem = this.engine.createSystem(
            DebugSystem,
            this.gameScene,
            this.context,
            width / height,
            this.gameRenderer.framebuffer
        );
        this.editorScriptSystem.start()
        this.gameRenderer.start()
        this.editorGizmoRenderer.start()
        this.cannonRenderer.start()
        this.gameScenePickingSystem.start()
        this.editorPickingSystem.start()
        this.debugSystem.start()
    }
    initEditor() {
        const debugLineEntity = this.engine.createEntity(this.gameScene);
        this.gameScene.addComponent(debugLineEntity, new DebugLine());
        console.log("debugLineEntity",debugLineEntity)
        this.generateDebugGrid(debugLineEntity.getComponent("DebugLine"));
    }
    sguiSetup() {
        this.SGui = new SGui();
    }

    editorCameraSetup() {
        this.editorScene.activeCamera = new Camera("perspective", {
            aspect_ratio: this.width / this.height,
        });
        this.gameScene.activeCamera = new Camera("perspective", {
            aspect_ratio: this.width / this.height,
        });
        const editorCamera = this.editorScene.activeCamera;
        const gameCamera = this.gameScene.activeCamera;
        editorCamera.zoom(-50);
        gameCamera.zoom(-50);
        this.canvas.addEventListener("wheel", (e) => {
            const rate = 1000;
            gameCamera.zoom(e.wheelDeltaY / rate);
            editorCamera.zoom(e.wheelDeltaY / rate);
        });
        this.canvas.addEventListener("drag", (e) => {
            if (this.canNavigate){
                this.isNavigating = true;
                const rate = 1000;
                if (e.detail.button == 1) {
                    editorCamera.panHorizontal(e.detail.dispX / rate);
                    editorCamera.panVertical(e.detail.dispY / rate);
                    gameCamera.panHorizontal(e.detail.dispX / rate);
                    gameCamera.panVertical(e.detail.dispY / rate);
                } else if (e.detail.button == 4) {
                    editorCamera.orbitX((e.detail.dispX / rate) * 100);
                    editorCamera.orbitY((e.detail.dispY / rate) * 100);
                    gameCamera.orbitX((e.detail.dispX / rate) * 100);
                    gameCamera.orbitY((e.detail.dispY / rate) * 100);
                }
            }
        });
        this.canvas.addEventListener("mousedown",(e)=>{
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = rect.height - (e.clientY - rect.top); // flip Y
            const gizmoId = this.editorPickingSystem.readColor(x,y)[0]
            if (gizmoId>0){
                this.canNavigate = false
                this.selectedGizmoId = gizmoId 
            }
            else{
                this.canNavigate = true
                this.selectedGizmoId = 0
            }
        })
        this.canvas.addEventListener("mouseup",(e)=>{
            this.isNavigating = false
            this.canNavigate = true
        })
    }

    generateDebugGrid(lineObj) {
        //let lineObj = debugLineEntity.getComponent("DebugLine");
        function drawGrid(lineComponent, numberOfLines, spacing) {
            let size = (numberOfLines * spacing - spacing) / 2;
            console.log("lineComponent",lineComponent)
            
            for (let i = 0; i < numberOfLines; i++) {
                lineComponent.addLine(
                    [-size,spacing * i - size,0, 0, 0, 0],
                    [size, spacing * i - size,0, 0, 0, 0]
                );
            }
            for (let i = 0; i < numberOfLines; i++) {
                lineComponent.addLine(
                    [spacing * i - size, -size,0, 0, 0, 0],
                    [spacing * i - size, size,0, 0, 0, 0]
                );
            }
        }

        drawGrid(lineObj, 61, 0.5);
    }

    initEventListeners() {
        this.canvas.addEventListener("picker-selection", (e) => {
            switch (e.detail.scene) {
                case this.editorScene:
                    break;
                case this.gameScene:
                    console.log("game Scenen")
                    break;
            }
            if (!this.isNavigating) {
                //console.log("selecting");
                if (e.detail.scene === this.editorScene) {
                } else {
                    this.activeObjects = [e.detail.entity];
                    this.canvas.dispatchEvent(
                        new CustomEvent("select-object", {
                            detail: e.detail,
                        })
                    );
                }
            } else {
                this.isNavigating = false;
            }
        });

        this.canvas.addEventListener("file-drop", async (e) => {
            const geometry = await parseOBJ(e.detail.content);
            this.addGameObject({
                geometry,
            });
        });
        this.canvas.ondragover = function (e) {
            return false;
        };

        document.addEventListener("set-active-object", (e)=>{
            this.activeObjects = [e.detail.entity]
            console.log("active objects",this.activeObjects)
        })
    }

    addEditorObject(objectInfo) {
        const editorObject = this.engine.createEntity(this.editorScene)
        for (const component of objectInfo.components) {
            this.editorScene.addComponent(editorObject, component)
        }
    }

    addGameObject(objectInfo) {
        const gameObject = this.engine.createEntity(this.gameScene);
        if (objectInfo.geometry) {
            const geometry = new Geometry(
                objectInfo.geometry.vertices,
                objectInfo.geometry.indices
            );
            this.gameScene.addComponent(gameObject, geometry);
            this.gameScene.addComponent(gameObject, new Transformation());
            this.gameRenderer.initGeometry(geometry);
        }
    }


    start() {
        this.engine.compositor.addFramebuffer(
            this.editorGizmoRenderer.framebuffer,
            {}
        );
        this.engine.compositor.addFramebuffer(
            this.gameRenderer.framebuffer,
            {}
        );
        this.engine.init();
        this.engine.start();
    }

    overlay(obj, newState, callback = () => {}) {
        obj.state = { ...obj.state, ...newState };
        callback();
    }

    toggleRunGame() {
        if (this.isGameRunning) {
            this.scriptSystem.pause()
            this.cannonPhysicsSystem.stop()
            
        } else {
            this.scriptSystem.start()
            this.cannonPhysicsSystem.start()
            console.log("cannonPhysicsSystem",this.cannonPhysicsSystem)
        }
        this.isGameRunning = !this.isGameRunning;
    }
    ipdateActiveMaterial(diffuseColor, ambientColor, specularColor, shininess) {
        if (this.activeObjects.length === 1) {
            this.activeObjects[0].getComponent("Geometry").materialOptions({
                diffuseColor,
                ambientColor,
                specularColor,
                shininess,
            });
        }
    }

    initWidgets() {
        this.transformationWindow = createTransformationWindow(this,this.SGui,this.canvas)
        this.sceneGraphWindow = createSceneGraphWindow(this.canvas,this.engine,this.SGui,this.gameScene)
        this.resourceWindow = createResourceWindow(this.canvas, this.SGui);
        this.menuBar = createMenuBar(this, this.canvas, this.SGui);
    }

    destroy() {
        if (this.eventHandler) {
            this.eventHandler.destroy();
        }
    }
}