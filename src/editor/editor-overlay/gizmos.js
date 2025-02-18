import {parseOBJ} from "../../../lib/parse-obj";
import {Transformation} from "../../ecs/classes";
import {Geometry, Script} from "../../ecs/component-classes";
import {Material} from "../../material/material";
import {arrow} from "../editor-assets";

export const createEditorGizmos = (engine,editor,scene) => {
    const arrowGeo = parseOBJ(arrow)
    const moveGizmo = {
            x: {
                geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices,new Material([1.,0.,0.],[1.,0.,0.],[1.,0.,0.],1)),
            transformation: new Transformation(
                {
                    Rz: 90
                }
            ),
            },
            y: {
                geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices,new Material([0.,1.,0.],[0.,1.,0.],[0.,1.,0.],1)),
                transformation: new Transformation({
                    Rx:90
                }),
            },
            z: {
                geometry: new Geometry(arrowGeo.vertices, arrowGeo.indices,new Material([0.,0.,1.],[0.,0.,1.],[0.,0.,1.],1)),
                transformation: new Transformation(),
            },
        };

    for (const arm of Object.values(moveGizmo)) {
        const arrowAxis = engine.createEntity(scene)
        arm.entity = arrowAxis;
        scene.addComponent(arrowAxis,arm.geometry)
        scene.addComponent(arrowAxis,arm.transformation)
        scene.addComponent(arrowAxis,new Script({update:updateAxis}))
        console.log(scene.componentRegister)
    }

    let selectedGizmo; 
    document.addEventListener("picker-selection", (e)=>{
        if (e.detail.scene == editor.editorScene) {
            console.log("gizmo selected")
            selectedGizmo = e.detail.entity.id
            editor.activeGizmo = selectedGizmo
        }
    })    
    
    document.addEventListener("click", (e)=>{
        selectedGizmo=-1;
        editor.activeGizmo = -1
    })
    document.addEventListener("mousemove", (e)=>{
        switch (selectedGizmo) {
            case moveGizmo.x.entity.id:
                console.log("dragging x")
                break;
            case moveGizmo.y.entity.id:
                console.log("dragging y")
                break;
            case moveGizmo.z.entity.id:
                console.log("dragging z")
                break;
            default:
                break;
        }
    }) 

    return {
        moveGizmo: moveGizmo
    }
}


const updateAxis = (deltaTime, components,scene) => {
    const camera = scene.getCamera()
    const dist = camera.dist(Object.values(components.Transformation[0].position))
    const scaleFactor = dist /10
    components.Transformation[0].setScale(scaleFactor,scaleFactor,scaleFactor)
}
