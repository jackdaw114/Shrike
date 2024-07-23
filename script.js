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

const CANVAS_WIDTH = canvas.width = document.body.clientWidth;
const CANVAS_HEIGHT = canvas.height = document.body.clientHeight;



const renderer = new Renderer(canvas,layer_list,{x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT/2}) 

renderer._drawRect({width:100,height:20},{})


const transformation  = new ShrikeObject('transformation','',new SMatrix())


const GameEngine = new Shrike(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT);

const GameObject = new ShrikeObject('render','rectangle',{width:101,height:10,color:'#ff4013'})

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
    this.params.matrix = [1,0,0,0,1,0,e.mouse_x,e.mouse_y,1] 
    if(e.keydown['a']){
    this.params.matrix = [1,0,0,0,1,0,e.mouse_x,e.mouse_y,1] 
    }
}

behaviorLayer.params.transformation_array = [transformation]




GameObject.transformation = transformation

GameEngine.activeLayer = baseLayer


GameEngine.shrikeRun();

