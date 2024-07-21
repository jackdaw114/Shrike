import EventHandler from './modules/EventHandler.js'
import Renderer from './modules/Renderer.js'
import { ShrikeObject, Shrike } from './modules/Shrike.js';
import SMatrix from './modules/SMatrix.js';

//let test_ele = document.getElementById('test_1')
//
//const eventBind = new EventHandler(test_ele)
//
//eventBind.init();
//

const canvas = document.getElementById('canvas1')


const layer_list =[]

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 300;



const renderer = new Renderer(canvas,layer_list,{x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT/2}) 

renderer._drawRect({width:100,height:20},{})


const transformation  = new ShrikeObject('transformation','',new SMatrix())


const GameEngine = new Shrike(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT);

const GameObject = new ShrikeObject('render','rectangle',{width:100,height:100,color:'#f000f3'})

const behaviorLayer = new ShrikeObject('layer','behavior',{
    hitbox_array : [],
    transformation_array : []
})

const geometryLayer = new ShrikeObject('layer','geometry',{
    object_array:[GameObject],
})


const baseLayer  = new ShrikeObject('layer','base',
    {
        behaviorLayer: behaviorLayer,
        geometryLayer:geometryLayer
    })


transformation.onFrame = function(e){
    console.log(e.mouse_x)
}

behaviorLayer.params.transformation_array = [transformation]




GameObject.transformation = transformation

GameEngine.activeLayer = baseLayer


GameEngine.shrikeRun();

