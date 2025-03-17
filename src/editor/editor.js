import { Shrike } from "../core/core";
import { parseOBJ } from "../../lib/parse-obj";
import { DebugLine, Geometry, Script } from "../ecs/component-classes";
import { Transformation } from "../ecs/classes";
import { MouseEvent } from "../event-handler/event-handler";
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

export class Editor {
    activeObjects = [];
    engine;
    cannonMaxSubSteps = 5;
    isNavigating = false;

    constructor(canvas, gameSpeed, width, height) {
        this.canvas = canvas;
        this.context = canvas.getContext("webgl2");
        this.width = width;
        this.height = height;
        this.gameSpeed = gameSpeed;
        this.engine = new Shrike(canvas, width, height);
        this.editorOverlays = {};
        this.initSystems();
        this.initEditor();
        this.editorCameraSetup();
        this.sguiSetup();
        this.initWidgets();

        this.initEventListeners();

        this.gizmos = createEditorGizmos(this.engine, this,this.editorScene);
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
            CannonPhysicsSystem,
            this.gameScene,
            gameSpeed,
            this.cannonMaxSubSteps
        );
        this.cannonRenderer = this.engine.createSystem(
            CannonRenderer,
            this.gameScene,
            this.context,
            width / height,
            width,
            height
        );
        this.scriptSystem = this.engine.createSystem(
            ScriptSystem,
            this.gameScene
        );
        this.editorScriptSystem = this.engine.createSystem(
            ScriptSystem,
            this.editorScene
        );
        this.editorScriptSystem.start()
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
    }
    initEditor() {
        const debugLineEntity = this.engine.createEntity(this.gameScene);
        this.gameScene.addComponent(debugLineEntity, new DebugLine());
        this.generateDebugGrid(debugLineEntity.getComponent("DebugLine"));
    }
    sguiSetup() {
        this.SGui = new SGui();
        this.materialWindow = {
            mainWindow: this.SGui.createWindow("Material", true),
            r: new SGuiSlider( this.canvas,{ value: 0, max: 255 }),
            g: new SGuiSlider( this.canvas,{ value: 0, max: 255 }),
            b: new SGuiSlider( this.canvas,{ value: 0, max: 255 }),
            diffusePanel: new SGuiContainer({ heading: "diffuse color:" }),
            colorPicker: new SGuiColorPicker(this.canvas ,{}),
        };
        this.materialWindow.diffusePanel.append(
            this.materialWindow.r,
            this.materialWindow.g,
            this.materialWindow.b,
            this.materialWindow.colorPicker
        );
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
            for (let i = 0; i < numberOfLines; i++) {
                lineComponent.addLine(
                    [-size, 0, spacing * i - size, 0, 0, 0],
                    [size, 0, spacing * i - size, 0, 0, 0]
                );
            }
            for (let i = 0; i < numberOfLines; i++) {
                lineComponent.addLine(
                    [spacing * i - size, 0, -size, 0, 0, 0],
                    [spacing * i - size, 0, size, 0, 0, 0]
                );
            }
        }

        drawGrid(lineObj, 60, 0.5);
    }

    initEventListeners() {
        this.mouseEvent = new MouseEvent(this.canvas);
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
        this.canvas.addEventListener("select-object", (e) => {

            //this.materialWindow.diffusePanel.appendChild(this.materialWindow.r)
            this.materialWindow.mainWindow.appendChild(
                this.materialWindow.diffusePanel
            );

        });

        this.canvas.addEventListener("slider-change", (e) => {
            console.log(e)
            switch (e.detail.id) {
                case this.materialWindow.r.id:
                    this.materialWindow.colorPicker.iroRef.color.rgb = {
                        r: e.detail.value,
                        g: this.materialWindow.g.getValue(),
                        b: this.materialWindow.b.getValue(),
                    };
                    break;
                case this.materialWindow.g.id:
                    this.materialWindow.colorPicker.iroRef.color.rgb = {
                        r: this.materialWindow.r.getValue(),
                        g: e.detail.value,
                        b: this.materialWindow.b.getValue(),
                    };
                    break;
                case this.materialWindow.b.id:
                    this.materialWindow.colorPicker.iroRef.color.rgb = {
                        r: this.materialWindow.r.getValue(),
                        g: this.materialWindow.g.getValue(),
                        b: e.detail.value,
                    };
                    break;
                default:
                    console.log("invalid window id:", e.detail.id);
                    break;
            }
        });
        this.canvas.addEventListener("color-change", (e) => {
            switch (e.detail.id) {
                case this.materialWindow.colorPicker.id:
                    this.activeObjects[0].getComponent(
                        "Geometry"
                    ).material.diffuseColor = [
                        e.detail.rgb.r,
                        e.detail.rgb.g,
                        e.detail.rgb.b,
                    ].map((val) => val / 255);
                    this.materialWindow.r.setValue(e.detail.rgb.r);
                    this.materialWindow.g.setValue(e.detail.rgb.g);
                    this.materialWindow.b.setValue(e.detail.rgb.b);
                    break;
                default:
                    console.log("unknown color picker id: ", e.detail.id);
            }
        });
        this.canvas.addEventListener("file-drop", (e) => {

            this.addGameObject({
                geometry: parseOBJ(e.detail.content),
            });
        });
        this.canvas.ondragover = function (e) {
            return false;
        };
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

    updateActiveMaterial(diffuseColor, ambientColor, specularColor, shininess) {
        if (this.activeObjects.length === 1) {
            this.activeObjects[0].getComponent("Geometry").materialOptions({
                diffuseColor,
                ambientColor,
                specularColor,
                shininess,
            });
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

    initWidgets() {
        this.transformationWindow = createTransformationWindow(this,this.SGui,this.canvas)
        this.sceneGraphWindow = createSceneGraphWindow(this.canvas,this.engine,this.SGui,this.gameScene)
        this.resourceWindow = createResourceWindow(this.canvas, this.SGui);
        this.menuBar = createMenuBar(this, this.canvas, this.SGui);
        this.propertiesWindow = createPropertiesWindow(this.activeObjects,this.SGui)
    }
}



