import Renderer from './Renderer.js';
import EventHandler from './EventHandler.js';
import {BehaviorHandler} from './BehaviorHandler.js'
import {CollisionHandler} from './CollisionHandler.js'


const fixedRate =100;

export class ShrikeRenderObject{
    constructor(type,params){
        this.type = type;
        this.params = params;
        this.transformationLink = null;
    }
    bindTransformation(shrikeTransform){
        if(shrikeTransform instanceof ShrikeTransform){
            this.transformationLink = shrikeTransform;
        }
        else{
            console.error("object to be linked is not an instance of ShrikeTransform class")
        }
    }
}

export class ShrikeTransform{
    constructor(){
        this.matrix = [1,0,0,0,1,0,0,0,1];
        this.link = null;
    }
    getMatrix(){
        return this.matrix
    }
    addLink(shrikeTransform){
        if(shrikeTransform instanceof ShrikeTransform){
            this.link = shrikeTransform;
        }
        else{
            console.error("object to be linked is not an instance of ShrikeTransform class")
        }
    }
}

export class ShrikeHitbox{
    constructor(type,params){
        this.type = type;
        this.params = params;
        this.transformationLink = null;
    }
    bindTransformation(shrikeTransform){
        if(shrikeTransform instanceof ShrikeTransform){
            this.transformationLink = shrikeTransform;
        }
        else{
            console.error("object to be linked is not an instance of ShrikeTransform class")
        }
    }
}

export class ShrikeLayer{
    constructor(type){
        this.type = type;
        this.array = [];            
    }
    push(shrikeObject){
        switch (this.type){
            case 'render':
                if(shrikeObject instanceof ShrikeRenderObject){
                    this.array.push(shrikeObject)
                }
                else{
                    console.error("object provided to ShrikeLayer is not an instance ShriekRenderObject class")
                }
                break;
            case 'collision':
                if(shrikeObject instanceof ShrikeHitbox){
                    this.array.push(shrikeObject)
                }
                else{
                    console.error("object provided to ShrikeLayer is not an instance of ShrikeHitbox class")
                }
                break;
        }
        
    }
}

export class ShrikeGate{
    constructor(geometryLayer,behaviorLayer,link){
        this.type = 'gate';
        this.geometryLayer = geometryLayer;
        this.behaviorLayer = behaviorLayer;
        this.access; 
        if(link){
            this.link = link;
        }
    }

}


export class ShrikeObject{
    constructor(type,subtype,params)
    {
        this.type = type;
        this.subtype = subtype;
        this.params = params; 
    } 
}

export class Shrike{
    /**
     *  default tickrate is 100ms
     *  
     * @param {HTMLCanvasElement} canvas - canvas element to draw on
     * @param {Number} gameSpeed - modifies the time scaling of the engine
     * @param {Number} width - hint for what the width of the canvas should be
     * @param {Number} height - hint for what the height of the canvas should be
     */
    constructor(canvas,gameSpeed,width, height){
        this.CANVAS_WIDTH = canvas.width =width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.shrikeCanvas = canvas; 
        this.gameSpeed = gameSpeed
        this.activeLayer = null;
        this._shrikeLoop = this._shrikeLoop.bind(this);
        this.center = {
            x: width/2,
            y: height/2,
        }
        this._shrikeInit();
        this.moduleList = [];
    }
    
    

    _shrikeInit(){
        this.eventObject = new EventHandler(this.shrikeCanvas);
        this.shrikeRenderer = new Renderer(this.shrikeCanvas,this.center);
        this.shrikeBehaviorHandler = new BehaviorHandler(this.shrikeCanvas,this.eventObject);
        this.shrikeCollisionHandler = new CollisionHandler() // AVRON: see what data u want here 
    }
   

    _preprocess(){ 
        this._shrikeInit();
        this.shrikeRenderer.init(this.layers,this.textures); 
    }
      
    _shrikeLoop = () => { 
        this.shrikeBehaviorHandler.loopFunction(this.activeLayer); //add a kind of event status here ig ? // active behavior layer?
        this.shrikeRenderer.loopFunction(this.activeLayer);   
        this.shrikeCollisionHandler.loopFunction(this.activeLayer);
        requestAnimationFrame(this._shrikeLoop);
    }
          
    shrikeRun(){
        // pre game loop functions here
        this._shrikeLoop();
        //any cleanup maybe idk never used javascript
    }
}

