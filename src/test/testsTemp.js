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

let canvas = document.getElementById("canvas1");
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);
const engine = new Shrike(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

const gameScene = engine.createScene();
const editorScene = engine.createScene();
engine.activateScene(editorScene);

const context = canvas.getContext("webgl2");
const renderer = engine.createSystem(
    Renderer,
    gameScene,
    canvas.getContext("webgl2"),
    CANVAS_WIDTH / CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);

const cannonRenderer = engine.createSystem(
    CannonRenderer,
    gameScene,
    canvas.getContext("webgl2"),
    renderer.framebuffer,
    CANVAS_WIDTH / CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);

const cannonPhysicsSystem = engine.createSystem(
    CannonPhysicsSystem,
    gameScene,
    1.0 / 60,
    3
);

const editorRenderer = engine.createSystem(
    Renderer,
    editorScene,
    canvas.getContext("webgl2"),
    CANVAS_WIDTH / CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);

// ********************* Test Stuff ******************

const scriptSystem = engine.createSystem(ScriptSystem, gameScene);
const pickingSystem = engine.createSystem(
    PickingSystem,
    gameScene,
    canvas,
    context,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);
canvas.addEventListener("game-object-selection", (e) => {
    console.log(e);
});
const debugSystem = engine.createSystem(
    DebugSystem,
    gameScene,
    canvas.getContext("webgl2"),
    CANVAS_WIDTH / CANVAS_HEIGHT,
    renderer.framebuffer
);
engine.compositor.addFramebuffer(editorRenderer.framebuffer, {});
engine.compositor.addFramebuffer(renderer.framebuffer, {});
const entity1 = engine.createEntity(gameScene);
const entity2 = engine.createEntity(gameScene);
const debugLineEntity = engine.createEntity(gameScene);

const arrowZAxis = engine.createEntity(editorScene);
const arrowXAxis = engine.createEntity(gameScene);
const arrowYAxis = engine.createEntity(gameScene);

//editorRenderer.options.clear = false;

const { indices, vertices } = parseOBJ(monke);
const { indices: arrowInd, vertices: arrowVert } = parseOBJ(arrow);

gameScene.addComponent(entity1, new Geometry(vertices, indices));
gameScene.addComponent(entity1, new Transformation());
gameScene.addComponent(entity2, new Geometry(vertices, indices));
gameScene.addComponent(entity2, new Transformation());
gameScene.addComponent(debugLineEntity, new DebugLine());
gameScene.addComponent(entity1, new Script());

editorScene.addComponent(arrowZAxis, new Geometry(arrowVert, arrowInd));
editorScene.addComponent(arrowZAxis, new Transformation());

editorScene.addComponent(arrowYAxis, new Geometry(arrowVert, arrowInd));
editorScene.addComponent(arrowYAxis, new Transformation());

editorScene.addComponent(arrowXAxis, new Geometry(arrowVert, arrowInd));
editorScene.addComponent(arrowXAxis, new Transformation());
entity1.getComponent("Geometry").materialOptions({
    diffuseColor: new Float32Array([1.0, 0.6, 0.0]),
    ambientColor: new Float32Array([0.7, 0.2, 0.2]),
    specularColor: new Float32Array([0.6, 0.8, 0.8]),
    shininess: 5,
});

const arrowTransformation = arrowZAxis.getComponent("Transformation");
const yArrowTransformation = arrowYAxis.getComponent("Transformation");
const xArrowTransformation = arrowXAxis.getComponent("Transformation");

mat4.scale(
    yArrowTransformation.getMatrix(),
    yArrowTransformation.getMatrix(),
    [0.5, 0.5, 0.5]
);

mat4.rotate(
    yArrowTransformation.getMatrix(),
    yArrowTransformation.getMatrix(),
    -Math.PI / 2,
    [1, 0, 0]
);

mat4.scale(
    xArrowTransformation.getMatrix(),
    yArrowTransformation.getMatrix(),
    [0.5, 0.5, 0.5]
);
mat4.rotate(
    xArrowTransformation.getMatrix(),
    yArrowTransformation.getMatrix(),
    -Math.PI / 2,
    [0, 0, 1]
);

// IMP
//arrowZAxis.getComponent('Geometry').depthTest=false
//arrowYAxis.getComponent('Geometry').depthTest=false
//arrowXAxis.getComponent('Geometry').depthTest=false

arrowXAxis.getComponent("Geometry").materialOptions({
    diffuseColor: new Float32Array([1, 0, 0]),
    specularColor: new Float32Array([1, 0, 0]),
    ambientColor: new Float32Array([1, 0, 0]),
    shininess: 0.3,
});

arrowYAxis.getComponent("Geometry").materialOptions({
    diffuseColor: new Float32Array([0, 1, 0]),
    specularColor: new Float32Array([0, 1, 0]),
    ambientColor: new Float32Array([0, 1, 0]),
    shininess: 0.3,
});

arrowZAxis.getComponent("Geometry").materialOptions({
    diffuseColor: new Float32Array([0, 0, 1]),
    specularColor: new Float32Array([0, 0, 1]),
    ambientColor: new Float32Array([0, 0, 1]),
    shininess: 0.3,
});
mat4.scale(
    arrowTransformation.getMatrix(),
    arrowTransformation.getMatrix(),
    [0.5, 0.5, 0.5]
);

//entity1.getComponent("Geometry").tint = new Float32Array([0,1,0])

const transformation = entity2.getComponent("Transformation");
const ent1Script = entity1.getComponent("Script");
ent1Script.update = (deltaTime, components) => {
    let { Transformation } = components;
    mat4.translate(Transformation.matrix, Transformation.matrix, [0, 0, 0.01]);
};

mat4.rotate(
    transformation.getMatrix(),
    transformation.getMatrix(),
    1.4,
    [0, 1, 0]
);
mat4.translate(
    transformation.getMatrix(),
    transformation.getMatrix(),
    [0, 0, 2]
);

let lineObj = debugLineEntity.getComponent("DebugLine");
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

//canvas.addEventListener("click", (e) => {
//    const rect = canvas.getBoundingClientRect();
//    const x = e.clientX - rect.left;
//    const y = rect.height - (e.clientY - rect.top); // flip Y
//    console.log(pickingSystem.readColor(x, y));
//});

const mouseEvents = new MouseEvent(canvas);
const tempCamera = gameScene.activeCamera;
editorScene.activeCamera = gameScene.activeCamera;

tempCamera.zoom(-10);
tempCamera.setPosition(new Float32Array([0, 10, 10]));
mouseEvents.addEventListener("drag", (e) => {
    const rate = 1000;
    if (e.button == 1) {
        tempCamera.panHorizontal(e.dispX / rate);
        tempCamera.panVertical(e.dispY / rate);
    } else if (e.button == 4) {
        tempCamera.orbitX((e.dispX / rate) * 100);
        tempCamera.orbitY((e.dispY / rate) * 100);
        console.log(tempCamera.right);
    }
});

mouseEvents.addEventListener("scroll", (e) => {
    const rate = 1000;
    tempCamera.zoom(e.wheelDeltaY / rate);
});

if (import.meta.env.DEV) {
    Promise.all([import("three"), import("cannon")]).then(([THREE, CANNON]) => {
        console.log("Loaded THREE.js for development:", THREE);
        console.log("Loaded CANNON.js for development:", CANNON);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        console.log(geometry);
        var size = 1;
        var height = 5;
        var damping = 0.01;
        var world = new CANNON.World();

        world.gravity.set(0, 0, -10);
        world.broadphase = new CANNON.NaiveBroadphase();

        // ground plane
        var groundMaterial = new CANNON.Material();
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });

        groundBody.addShape(groundShape);
        world.addBody(groundBody);

        var mass = 10;
        var sphereShape = new CANNON.Sphere(size);
        console.log("sphere details", sphereShape);
        // Shape on plane
        var mat1 = new CANNON.Material();
        var shapeBody1 = new CANNON.Body({
            mass: mass,
            material: mat1,
            position: new CANNON.Vec3(3 * size, size, height),
        });
        //shapeBody1.addShape(sphereShape);
        shapeBody1.linearDamping = damping;
        //world.addBody(shapeBody1);

        console.log(shapeBody1);
        var mat2 = new CANNON.Material();
        var shapeBody2 = new CANNON.Body({
            mass: mass,
            material: mat2,
            position: new CANNON.Vec3(0, size, height),
        });
        //shapeBody2.addShape(sphereShape);
        //shapeBody2.linearDamping = damping;
        //world.addBody(shapeBody2);

        var mat3 = new CANNON.Material();
        var shapeBody3 = new CANNON.Body({
            mass: mass,
            material: mat3,
            position: new CANNON.Vec3(-3 * size, size, height),
        });
        shapeBody3.addShape(sphereShape);
        shapeBody3.linearDamping = damping;
        world.addBody(shapeBody3);
        shapeBody3.velocity = new CANNON.Vec3(1, 0, 0);
        // Create contact material behaviour
        var mat1_ground = new CANNON.ContactMaterial(groundMaterial, mat1, {
            friction: 0.0,
            restitution: 0.0,
        });
        var mat2_ground = new CANNON.ContactMaterial(groundMaterial, mat2, {
            friction: 0.0,
            restitution: 0.7,
        });
        var mat3_ground = new CANNON.ContactMaterial(groundMaterial, mat3, {
            friction: 0.0,
            restitution: 0.9,
        });

        world.addContactMaterial(mat1_ground);
        world.addContactMaterial(mat2_ground);
        world.addContactMaterial(mat3_ground);
        console.log("shapebody3", shapeBody3);
        shapeBody3.addEventListener("collide", (e) => {
            console.log(e);
        });

        let oldGameLoop = engine.gameLoop;

        engine.gameLoop = (e) => {
            oldGameLoop(e);
            if (engine.lastFrameTime) {
                world.step(1.0 / 60.0, e - engine.lastFrameTime, 3);
            }
            //console.log(world.collisionMatrix.matrix[0])
            entity1.getComponent("Transformation").matrix[13] =
                shapeBody3.position.z;
            entity1.getComponent("Transformation").matrix[12] =
                shapeBody3.position.x;
        };
    });
}
// ********************* END *************************

console.log(window.devicePixelRatio);
engine.init();
engine.start();

export class Editor {
    activeObjects = [];
    #engine;
    cannonMaxSubSteps = 5;

    constructor(canvas, gameSpeed, width, height) {
        this.canvas = canvas;
        this.context = canvas.getContext("webgl2");
        this.gameSpeed = gameSpeed;
        this.#engine = new Shrike(context, width, height);
        this.editorScene = this.#engine.createScene();
        this.#engine.activateScene(editorScene);
        this.editorRenderer = engine.createSystem(
            Renderer,
            this.editorScene,
            width / height,
            width,
            height
        );

        this.gameScene = this.#engine.createScene();
        this.gameRenderer = engine.createSystem(
            Renderer,
            this.gameScene,
            width / height,
            width,
            height
        );
        this.cannonPhysicsSystem = this.#engine.createSystem(
            CannonPhysicsSystem,
            this.gameScene,
            gameSpeed,
            this.cannonMaxSubSteps
        );
        this.cannonRenderer = engine.createSystem(
            CannonRenderer,
            this.gameScene,
            context,
            width / height,
            width,
            height
        );
        this.scriptSystem = this.#engine.createSystem(ScriptSystem, gameScene);

        this.gameScenePickingSystem = engine.createSystem(
            PickingSystem,
            this.gameScene,
            context,
            width,
            height
        );

        this.editorPickingSystem = engine.createSystem(
            PickingSystem,
            this.editorScene,
            context,
            width,
            height
        );

        this.debugSystem = engine.createSystem(
            DebugSystem,
            this.gameScene,
            context,
            width / height,
            this.gameRenderer.framebuffer
        );
    }
    initEditor() {
        const arrow = parseOBJ(arrow);
        this.moveWidget = {
            x: {
                geometry: new Geometry(...arrow),
                transformation: new Transformation(),
            },
            y: {
                geometry: new Geometry(...arrow),
                transformation: new Transformation(),
            },
            z: {
                geometry: new Geometry(...arrow),
                transformation: new Transformation(),
            },
        };
    }
    initEventListeners() {
        this.canvas.addEventListener("game-object-selection", (e) => {
            if (e.detail.scene === this.editorScene) {

            } else {
                this.activeObjects = [e.detail.entity];
            }
        });
    }
    addGameObject(objectInfo) {
        const gameObject = this.#engine.createEntity(this.gameScene)
        if (objectInfo.geometry) {
            this.gameScene.addComponent(gameObject, new Geometry(objectInfo.geometry.indices,objectInfo.geometry.vertices))
        }
    }
}
