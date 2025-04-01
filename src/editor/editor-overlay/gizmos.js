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
        console.log("looping",key,arm)
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
        console.log(scene.componentRegister)
    })
    const rect = editor.canvas.getBoundingClientRect();
    const RATE = 2500
    editor.canvas.addEventListener("drag", (e) => {
        console.log("drag", editor.selectedGizmoId)
        engine.entities.forEach(entity => {
            console.log("entity", entity.id)
        })
        if (editor.activeObjects[0]) {
            const dispX = Math.hypot(e.detail.dragEndPos.x, e.detail.dragEndPos.y) * Math.sign(e.detail.dispX)
            const dispY = Math.hypot(e.detail.dragEndPos.x, e.detail.dragEndPos.y) * Math.sign(e.detail.dispY)
            console.log("dispX", dispX, "dispY", dispY)
            console.log("gizmos are ", moveGizmo.x.entity.id, moveGizmo.y.entity.id, moveGizmo.z.entity.id)
            switch (editor.selectedGizmoId) {
                case moveGizmo.x.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(dispX / RATE, 0, 0)
                    console.log("transformation",editor.activeObjects[0].getComponent("Transformation"))
                    break;
                case moveGizmo.y.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(0, dispX / RATE,0)
                    console.log("transformation",editor.activeObjects[0].getComponent("Transformation"))
                    break;
                case moveGizmo.z.entity.id:
                    editor.activeObjects[0].getComponent("Transformation").translate(0,0,-dispY / RATE)
                    console.log("transformation",editor.activeObjects[0].getComponent("Transformation"))
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
    const scaleFactor = dist / 12
    components.Transformation[0].setScale(scaleFactor, scaleFactor, scaleFactor)
}
