import { EventHandlerRewrite } from './modules/EventHandler.js';
import { Shrike,ShrikeHitbox,ShrikeGate, ShrikeRenderObject,ShrikeLayer,ShrikeTransform } from './modules/Shrike.js';
import { WebGlTest } from './modules/WebGLInterface.js';

const canvas = document.getElementById('canvas1')

// this is resolution not actual dom element size
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight; 

//let testGl = new WebGlTest(canvas)
//testGl.initTest()

const GameEngine = new Shrike(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT);



const GameObject = new ShrikeRenderObject('rectangle',{width:100,height:100,color:'#ff4013'}) // implement non pixel based rendering
const GameObject2 = new ShrikeRenderObject('rectangle',{width:10,height:150,color:'#004013'}) // implement non pixel based rendering

const Hitbox = new ShrikeHitbox('rectangle',{width:100,height:100,color:'#ff4013'})
const transformation  = new ShrikeTransform()
const transformation2  = new ShrikeTransform()

GameObject.bindTransformation(transformation)
GameObject2.bindTransformation(transformation2)
Hitbox.bindTransformation(transformation)

const behaviorLayer = new ShrikeLayer('collision')
const clickableLayer = new ShrikeLayer('clickable')  // looks like a subtype will be required T_T
const geometryLayer = new ShrikeLayer('render')


geometryLayer.push(GameObject)
geometryLayer.push(GameObject2)
clickableLayer.push(Hitbox) // to be changed
console.log(clickableLayer)



const eventTest = new EventHandlerRewrite(canvas) 

eventTest.addEventListener('mousemove',(e)=>{
})

canvas.addEventListener('click',(e)=>{})



const baseLayer  = new ShrikeGate(geometryLayer,{},clickableLayer) // what i had explained as base layer is now called gate

Hitbox.bindOnClick()

transformation.matrix.e =100
transformation.matrix.f =100


GameEngine.bindPerFrameFunction((e)=>{ //all syntax in this function will change once complete 
    if(Hitbox.click){
        transformation.matrix.e = e.mouseCoords.x
        transformation.matrix.f = e.mouseCoords.y 
        transformation2.matrix.c = e.mouseCoords.y/500
        GameObject.params.color = "#fd0000"
    } 
    else{
        GameObject.params.color = "#fe00fd"
    }
})



GameEngine.setActiveLayer(baseLayer) // for now this just activates a layer if u have 2 layers can switch between them

GameEngine.shrikeRun();
