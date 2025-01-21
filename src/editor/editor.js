import { Shrike } from "../core/core";
import { parseOBJ } from "../../lib/parse-obj";
import { monke } from "../../monke";
import { arrow } from "./editor-assets";
import { DebugLine, Geometry, Script } from "../ecs/component-classes";
import { Transformation } from "../ecs/classes";
import { glMatrix, mat4 } from "gl-matrix";
import { MouseEvent } from "../event-handler/event-handler";
import { DebugSystem } from "../gpu/debug-graphics/debug-helper";
import { Renderer } from "../gpu/renderer/renderer";
import { ScriptSystem } from "../script-system/script-system";
import { PickingSystem } from "../gpu/picker/picker";
import { CannonRenderer } from "../gpu/cannon-renderer/cannon-renderer";
import { CannonPhysicsSystem } from "../physics/cannon-physics-system";

export class Editor {
    activeObjects = [];
    #engine;
    cannonMaxSubSteps = 5;
    isNavigating = false;

    constructor(canvas, gameSpeed, width, height) {
        this.canvas = canvas;
        this.context = canvas.getContext("webgl2");
        this.width = width;
        this.height = height;
        this.gameSpeed = gameSpeed;
        this.#engine = new Shrike(canvas, width, height);
        this.initSystems();
        this.initEventListeners();
        this.initEditor();
        this.editorCameraSetup();

        const arrowZAxis = this.#engine.createEntity(this.editorScene);
        const arrowXAxis = this.#engine.createEntity(this.editorScene);
        const arrowYAxis = this.#engine.createEntity(this.editorScene);
    
        this.editorScene.addComponent(arrowXAxis, this.moveWidget.x.geometry)
        this.editorScene.addComponent(arrowYAxis, this.moveWidget.y.geometry)
        this.editorScene.addComponent(arrowZAxis, this.moveWidget.z.geometry)

        this.editorScene.addComponent(arrowXAxis, this.moveWidget.x.transformation)
        this.editorScene.addComponent(arrowYAxis, this.moveWidget.y.transformation)
        this.editorScene.addComponent(arrowZAxis, this.moveWidget.z.transformation)
    }
    initSystems() {
        const width = this.width;
        const height = this.height;
        const gameSpeed = this.gameSpeed;
        this.editorScene = this.#engine.createScene();
        this.editorRenderer = this.#engine.createSystem(
            Renderer,
            this.editorScene,
            this.context,
            width / height,
            width,
            height
        );

        this.gameScene = this.#engine.createScene();
        this.gameRenderer = this.#engine.createSystem(
            Renderer,
            this.gameScene,
            this.context,
            width / height,
            width,
            height
        );
        this.#engine.activateScene(this.gameScene);
        this.#engine.activateScene(this.editorScene);
        console.log(this.#engine.scenes)

        this.cannonPhysicsSystem = this.#engine.createSystem(
            CannonPhysicsSystem,
            this.gameScene,
            gameSpeed,
            this.cannonMaxSubSteps
        );
        this.cannonRenderer = this.#engine.createSystem(
            CannonRenderer,
            this.gameScene,
            this.context,
            width / height,
            width,
            height
        );
        this.scriptSystem = this.#engine.createSystem(
            ScriptSystem,
            this.gameScene
        );
        this.gameScenePickingSystem = this.#engine.createSystem(
            PickingSystem,
            this.gameScene,
            this.canvas,
            this.context,
            width,
            height
        );

        this.editorPickingSystem = this.#engine.createSystem(
            PickingSystem,
            this.editorScene,
            this.canvas,
            this.context,
            width,
            height
        );
        this.debugSystem = this.#engine.createSystem(
            DebugSystem,
            this.gameScene,
            this.context,
            width / height,
            this.gameRenderer.framebuffer
        );
    }
    initEditor() {
        const arrowGeo = parseOBJ(arrow);
        console.log(arrowGeo)
        this.moveWidget = {
            x: {
                geometry: new Geometry(arrowGeo.vertices,arrowGeo.indices),
                transformation: new Transformation(),
            },
            y: {
                geometry: new Geometry(arrowGeo.vertices,arrowGeo.indices),
                transformation: new Transformation(),
            },
            z: {
                geometry: new Geometry(arrowGeo.vertices,arrowGeo.indices),
                transformation: new Transformation(),
            },
        };
        //const widget = this.#engine.createEntity(this.editorScene);


        const debugLineEntity = this.#engine.createEntity(this.gameScene);
        this.gameScene.addComponent(debugLineEntity, new DebugLine());
        this.generateDebugGrid(debugLineEntity.getComponent("DebugLine"));
    }
    editorCameraSetup() {
        const editorCamera = this.editorScene.activeCamera;
        this.gameScene.activeCamera = editorCamera;
        editorCamera.zoom(-20);

        this.canvas.addEventListener("wheel", (e) => {
            const rate = 1000;
            editorCamera.zoom(e.wheelDeltaY / rate);
        });
        this.canvas.addEventListener("drag", (e) => {
            this.isNavigating = true;
            const rate = 1000;
            if (e.detail.button == 1) {
                editorCamera.panHorizontal(e.detail.dispX / rate);
                editorCamera.panVertical(e.detail.dispY / rate);
            } else if (e.detail.button == 4) {
                editorCamera.orbitX((e.detail.dispX / rate) * 100);
                editorCamera.orbitY((e.detail.dispY / rate) * 100);
            }
        });
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

        drawGrid(lineObj, 15, 0.5);
    }

    initEventListeners() {
        this.mouseEvent = new MouseEvent(this.canvas);
        this.canvas.addEventListener("game-object-selection", (e) => {
            if (!this.isNavigating) {
                console.log("selecting");

                if (e.detail.scene === this.editorScene) {
                } else {
                    this.activeObjects = [e.detail.entity];
                }
            } else {
                this.isNavigating = false;
            }
        });
    }
    addGameObject(objectInfo) {
        const gameObject = this.#engine.createEntity(this.gameScene);
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
        this.#engine.compositor.addFramebuffer(
            this.gameRenderer.framebuffer,
            {}
        );
        this.#engine.compositor.addFramebuffer(
            this.editorRenderer.framebuffer,
            {}
        );
        this.#engine.init();
        this.#engine.start();
    }
}
