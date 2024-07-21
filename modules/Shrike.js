import SMatrix from './SMatrix.js';
import Renderer from './Renderer.js';
import EventHandler from './EventHandler.js';
import BehaviorHandler from './BehaviorHandler.js'

//export class ShrikeLayer{  // use ShrikeObject instead of this (better)
//    constructor(type,options){
//        this.type = type;
//        this.options = options;
//        this.object_list = [];
//        this.bound = null;
//    }
//    _calculateBound(){
//
//    }
//    pushObjects(shrike_objects){
//        for(const shrike_object of shrike_objects){
//            this.object_list.push(shrike_object);
//        }
//    } 
//
//}

export class BehaviorParams{
    constructor(onClick,onKeyPress,perFrame){
        this.onClick = onClick;
        this.onKeyPress = onKeyPress;
        this.perFrame = perFrame;
    }

    // create a prototype like class here for Debuging ig?
}

export class ShrikeObject{
    constructor(type,subtype,params)
    {
        this.type = type;
        this.subtype = subtype;
        this.params = params; // for texture this will be source | for transformation it will be a matrix | for behavior objects it will be  | for layers it will be an object array | for base type layer it will be the differnet kinds of layers in a json object
    } 
    addLink(shrikeObject){
        this.link = shrikeObject; // link of a base layer should be another 'base layer subtype'
    }

     
    bindTransformation(shrikeObject){
        // check if object is of type transformation
        this.transformation = shrikeObject; 
    }
    // perFrame() onClick() onKeyPress()
}

/*
    param specifications:-
        type: LAYER
            subtype: base
                {
                    geometryLayer:
                    behaviorLayer: 
                    actionSpec: (bitwise)
                    // NOTE: make it so that the linked structure is the reverse at the end(child points to parent)
                }
            subtype: behavior
                {
                    object_array:  // NOTE: objects of specified subtype only
                    last_child:
                    
                }
            subtype: geometry
                {
                    object_array:
                    damaged:
                }
        type: GEOMETRY | COLLIDER
            subtype: rectangle
            {
                width:
                height:
                color:
            }
            subtype: circle
            {
                r:
            }
        
        

*/

export class Shrike{
    constructor(canvas,game_speed,width, height){
        this.CANVAS_WIDTH = canvas.width =width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.shrikeCanvas = canvas; 
        this.eventObject = new EventHandler(canvas);
        this.layers = []; //active layer stack 
        this.sync_objects=[]; // 
// behavior layers and graphics layers ?? (can be done without)
        this.game_speed = game_speed
        this.activeLayer = new ShrikeObject('layer','base',null);
        this._shrikeLoop = this._shrikeLoop.bind(this);
        this.center = {
            x: width/2,
            y: height/2,
        }
    }
      
    _shrikeInit(){
        //list of all objects that have to be updated every frame

        this.shrikeRenderer = new Renderer(this.shrikeCanvas);
        this.shrikeBehaviorHandler = new BehaviorHandler(this.shrikeCanvas);
    }
   

    _preprocess(){ 
        this._shrikeInit();
        this.shrikeRenderer.init(this.layers,this.textures); 
    }
      
    _shrikeLoop = () => { 
        this.shrikeBehaviorHandler.loopFunction(this.activeLayer); //add a kind of event status here ig ? // active behavior layer?
        this.shrikeRenderer.loopFunction(this.activeLayer);   

        requestAnimationFrame(this._shrikeLoop);
    }
          
    shrikeRun(){
        this._shrikeLoop();
    }
}


//layer Structure:-
//                        ┌──────────┐                
//                        │base layer│                
//                        └────┬─────┘                
//                             │                      
//             ┌───────────────┴──────────────┐       
//             │                              │       
//      ┌──────┴───────┐              ┌───────┴──────┐
//      │geometry layer│              │behavior layer│
//      └──────────────┘              └──────────────┘
//             ▼                              ▼       
//      ┌──────────────┐              ┌──────────────┐
//      │geometry layer│              │behavior layer│
//      └──────┬───────┘              └───────┬──────┘
//             │                              │       
//             └───────────────┬──────────────┘       
//                             │                      
//                             │                      
//                             │                      
//                             ▼                      
//                        ┌──────────┐                
//                        │base layer│                
//                        └────┬─────┘                
//                             │                      
//             ┌───────────────┴──────────────┐       
//             │                              │       
//      ┌──────┴───────┐              ┌───────┴──────┐
//      │geometry layer│              │behavior layer│
//      └──────────────┘              └──────────────┘
//             ▼                              ▼       
//      ┌──────────────┐              ┌──────────────┐
//      │geometry layer│              │behavior layer│
//      └──────┬───────┘              └───────┬──────┘
//             │                              │       
//             └───────────────┬──────────────┘       
//                             │                      
//                             │                      
//                             │                      
//                             ▼                      
//                        ┌──────────┐                
//                        │base layer│                
//                        └──────────┘                
