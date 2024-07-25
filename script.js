import EventHandler from './modules/EventHandler.js'
import Renderer from './modules/Renderer.js'
import { Shrike,ShrikeHitbox,ShrikeGate, ShrikeRenderObject,ShrikeLayer,ShrikeTransform } from './modules/Shrike.js';

const canvas = document.getElementById('canvas1')

const CANVAS_WIDTH = canvas.width = document.body.clientWidth;
const CANVAS_HEIGHT = canvas.height = document.body.clientHeight;


const GameEngine = new Shrike(canvas,1,CANVAS_WIDTH,CANVAS_HEIGHT);

const GameObject = new ShrikeRenderObject('rectangle',{width:101,height:10,color:'#ff4013'})
const Hitbox = new ShrikeHitbox('rectangle',{width:101,height:10,color:'#ff4013'})
const transformation  = new ShrikeTransform()
GameObject.bindTransformation(transformation)
Hitbox.bindTransformation(transformation)

const behaviorLayer = new ShrikeLayer('collision')

const geometryLayer = new ShrikeLayer('render')

geometryLayer.push(GameObject)
behaviorLayer.push(Hitbox)

const baseLayer  = new ShrikeGate(geometryLayer,behaviorLayer)

Hitbox.onFrame = function(e){
        transformation.matrix = [1,0,0,0,1,0,e.mouse_x,e.mouse_y,1] 
    if(e.keydown['a']){
        transformation.matrix = [1,0,0,0,1,0,0,0,1] 
    }
}







GameEngine.activeLayer = baseLayer


GameEngine.shrikeRun();

