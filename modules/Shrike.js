import ShrikeMatrix from './SMatrix.js' ;
import Renderer from './Renderer.js';
import EventHandler from './EventHandler.js';
import {BehaviorHandler} from './BehaviorHandler.js'
import {CollisionHandler} from './CollisionHandler.js'


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
        this.matrix = new ShrikeMatrix();
        this.link = null;
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
    constructor(type){
        this.type = type;
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

export class ShrikeBaseLayer{
    constructor(link){
        this.geometryLayer;
        this.behaviorLayer;
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
    constructor(canvas,game_speed,width, height){
        this.CANVAS_WIDTH = canvas.width =width;
        this.CANVAS_HEIGHT = canvas.height = height;
        this.shrikeCanvas = canvas; 
        this.game_speed = game_speed
        this.activeLayer = null;
        this._shrikeLoop = this._shrikeLoop.bind(this);
        this.center = {
            x: width/2,
            y: height/2,
        }
        this._shrikeInit();
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

