import EventHandler from './modules/EventHandler.js'
import Renderer from './modules/Renderer.js'
import { ShrikeObject } from './modules/Shrike.js';
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



const object_arr = [{
    type:'geometry',
    subtype:'rectangle',
    params:{
        width: 100,
        height: 100,
        color: '#434313'
    },
    transformation:transformation,
}]

renderer._renderLayer({
    params:{
        object_array:object_arr
    },
    
})

