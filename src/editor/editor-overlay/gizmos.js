import { parseOBJ } from "../../../lib/parse-obj";
import { Transformation } from "../../ecs/classes";
import { Geometry, Script } from "../../ecs/component-classes";
import { Material } from "../../material/material";
import { arrow } from "../editor-assets";

export const createEditorGizmos = (engine, editor, scene) => {
    const arrowGeo = parseOBJ(arrow)
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
        const arrowAxis = engine.createEntity(scene)
        arm.entity = arrowAxis;
        moveGizmo[key].entity = arrowAxis
        console.log("the arrow axis is", arrowAxis.id)
        scene.addComponent(arrowAxis, arm.geometry)
        scene.addComponent(arrowAxis, arm.transformation)
        scene.addComponent(arrowAxis, new Script({
            update: (deltaTime, components, scene) => {
                if (editor.activeObjects[0]) {
                    const position = editor.activeObjects[0].getComponent("Transformation").position
                    components.Transformation[0].setPosition(position)
                }
                updateAxis(deltaTime, components, scene)
            }
        }))
        editor.addEditorObject({
            components: [
                arm.geometry,
                arm.transformation,
                new Script({update:updateAxis})
            ]
        })
        //scene.addComponent(arrowAxis,arm.geometry)
        //scene.addComponent(arrowAxis,arm.transformation)
        //scene.addComponent(arrowAxis,new Script({update:updateAxis}))
        console.log(scene.componentRegister)
    })
    const rect = editor.canvas.getBoundingClientRect();
    const RATE = 2500
    editor.canvas.addEventListener("drag", (e) => {
        if (editor.activeObjects[0]) {
            const dispX = Math.hypot(e.detail.dragEndPos.x, e.detail.dragEndPos.y) * Math.sign(e.detail.dispX)
            const dispY = Math.hypot(e.detail.dragEndPos.x, e.detail.dragEndPos.y) * Math.sign(e.detail.dispY)
            switch (editor.selectedGizmoId) {
                case moveGizmo.x.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(dispX / RATE, 0, 0)
                    break;
                case moveGizmo.y.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(0, 0, dispX / RATE)
                    break;
                case moveGizmo.z.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(0,-dispY / RATE, 0)
                    break;
            }

        }
    })
    return {
        moveGizmo: moveGizmo
    }
}


const updateAxis = (deltaTime, components, scene) => {
    const camera = scene.getCamera()
    const dist = camera.dist(Object.values(components.Transformation[0].position))
    const scaleFactor = dist / 10
    components.Transformation[0].setScale(scaleFactor, scaleFactor, scaleFactor)
}
