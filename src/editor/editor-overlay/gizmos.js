import { vec3 } from "gl-matrix";
import { parseOBJ } from "../../../lib/parse-obj";
import { Transformation } from "../../ecs/classes";
import { Geometry, Script } from "../../ecs/component-classes";
import { Material } from "../../material/material";
import { arrow } from "../editor-assets";

export const createEditorGizmos = async (engine, editor, scene) => {
    const arrowGeo = await parseOBJ(arrow)
    const moveGizmo = {
        x: {
            geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices, new Material([1., 0., 0.], [1., 0., 0.], [1., 0., 0.], 1)),
            transformation: new Transformation(
                {
                    Rz: 90
                }
            ),
        },
        y: {
            geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices, new Material([0., 1., 0.], [0., 1., 0.], [0., 1., 0.], 1)),
            transformation: new Transformation({
                Rx: 90
            }),
        },
        z: {
            geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices, new Material([0., 0., 1.], [0., 0., 1.], [0., 0., 1.], 1)),
            transformation: new Transformation(),
        },
    };



    Object.entries(moveGizmo).forEach(([key, arm]) => {
        // console.log("looping",key,arm)
        const arrowAxis = engine.createEntity(scene)
        arm.entity = arrowAxis;
        moveGizmo[key].entity = arrowAxis
        // console.log("the arrow axis is", arrowAxis.id)
        scene.addComponent(arrowAxis, arm.geometry)
        scene.addComponent(arrowAxis, arm.transformation)
        scene.addComponent(arrowAxis, new Script({
            update: (deltaTime,CANNON, components, scene) => {
                if (editor.activeObjects[0] && editor.activeObjects[0].getComponent("Transformation")) {
                    const position = editor.activeObjects[0].getComponent("Transformation").position
                    components.Transformation[0].setPosition(position)
                }
                updateAxis(deltaTime,CANNON, components, scene)
            }
        }))
        // editor.addEditorObject({
        //     components: [
        //         arm.geometry,
        //         arm.transformation,
        //         new Script({update:updateAxis})
        //     ]
        // })
        //scene.addComponent(arrowAxis,arm.geometry)
        //scene.addComponent(arrowAxis,arm.transformation)
        //scene.addComponent(arrowAxis,new Script({update:updateAxis}))
        // console.log(scene.componentRegister)
    })
    const rect = editor.canvas.getBoundingClientRect();
    const RATE = 2500
    editor.canvas.addEventListener("drag", (e) => {
        // console.log("drag", editor.selectedGizmoId)
        const camera = editor.gameScene.getCamera()
        const gizmoPosition = moveGizmo.x.entity.getComponent("Transformation").position
        const xGizmoPosition = new Float32Array([gizmoPosition.x,gizmoPosition.y,gizmoPosition.z])
        const xGizmoDepth =vec3.dist(xGizmoPosition,camera.position)
        const mousePosition = camera.unproject(
            e.detail.currentX,
            e.detail.currentY,
            editor.canvas.width,
            editor.canvas.height,
            xGizmoDepth
        )
        console.log("mouse position in world space", mousePosition)
        engine.entities.forEach(entity => {
            // console.log("entity", entity.id)
        })
        if (editor.activeObjects[0]) {
            switch (editor.selectedGizmoId) {
                case moveGizmo.x.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").setPositionX(mousePosition[0])
                    break;
                case moveGizmo.y.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").setPositionY(mousePosition[2])
                    break;
                case moveGizmo.z.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").setPositionZ(mousePosition[1])
                    break;
            }

        }
    })
    return {
        moveGizmo: moveGizmo
    }
}


const updateAxis = (deltaTime,CANNON, components, scene) => {
    const camera = scene.getCamera()
    const dist = camera.dist(Object.values(components.Transformation[0].position))
    const scaleFactor = dist / 12
    components.Transformation[0].setScale(scaleFactor, scaleFactor, scaleFactor)
}
