import { EventHandlerRewrite } from './modules/EventHandler.js';
import { Shrike,ShrikeHitbox,ShrikeGate, ShrikeRenderObject,ShrikeLayer,ShrikeTransform } from './modules/Shrike.js';

const canvas = document.getElementById('canvas1')

// this is resolution not actual dom element size
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight; 

const GameEngine = new Shrike(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT);



const GameObject = new ShrikeRenderObject('rectangle',{width:100,height:100,color:'#ff4013'}) // implement non pixel based rendering
const Hitbox = new ShrikeHitbox('rectangle',{width:100,height:100,color:'#ff4013'})
const transformation  = new ShrikeTransform()

GameObject.bindTransformation(transformation)
Hitbox.bindTransformation(transformation)

const behaviorLayer = new ShrikeLayer('collision')
const clickableLayer = new ShrikeLayer('clickable')  // looks like a subtype will be required T_T
const geometryLayer = new ShrikeLayer('render')


geometryLayer.push(GameObject)
clickableLayer.push(Hitbox)
console.log(clickableLayer)


const eventTest = new EventHandlerRewrite(canvas) 
eventTest.addEventListener('mousemove',(e)=>{
    console.log(e)
})

canvas.addEventListener('click',(e)=>console.log(e))



const baseLayer  = new ShrikeGate(geometryLayer,{},clickableLayer) // what i had explained as base layer is now called gate

Hitbox.bindOnClick()

transformation.matrix.e =100
transformation.matrix.f =100


GameEngine.bindPerFrameFunction((e)=>{ //all syntax in this function will change once complete 
    if(Hitbox.click){
        transformation.matrix.e = e.mouseCoords.x
        transformation.matrix.f = e.mouseCoords.y 
        GameObject.params.color = "#fd0000"
    } 
    else{
        GameObject.params.color = "#fe00fd"
    }
})



GameEngine.setActiveLayer(baseLayer) // for now this just activates a layer if u have 2 layers can switch between them

GameEngine.shrikeRun();
