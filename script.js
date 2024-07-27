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

const geometryLayer = new ShrikeLayer('render')
const clickableLayer = new ShrikeLayer('clickable')


geometryLayer.push(GameObject)
clickableLayer.push(Hitbox)
console.log(clickableLayer)
//behaviorLayer.push(Hitbox) // behavior system removal is needed unified update and fixed update function replaces it  



const baseLayer  = new ShrikeGate(geometryLayer,{},clickableLayer)

Hitbox.bindOnClick()

transformation.matrix.e =100
transformation.matrix.f =100


GameEngine.bindPerFrameUpdateFunction((e)=>{
    if(Hitbox.click){
        transformation.matrix.e = e.mouseCoords.x
        transformation.matrix.f = e.mouseCoords.y
    } 
})



GameEngine.setActiveLayer(baseLayer)

GameEngine.shrikeRun();
