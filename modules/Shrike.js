import Renderer from './Renderer.js';
import EventHandler from './EventHandler.js';
import {BehaviorHandler} from './BehaviorHandler.js'
import {CollisionHandler} from './SempiCollisionHandler.js'


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
        this.matrix =new DOMMatrix([1,0,0,1,0,0]); // (each 3 is a basis vector)
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
    transformPoint(x,y){
        return {x:(this.matrix[0]*x + this.matrix[3]*y + this.matrix[6]),
            y:(this.matrix[1]*x + this.matrix[4]*y + this.matrix[7])}
    }
}

export class ShrikeHitbox{
    constructor(type,params){
        this.type = type;
        this.params = params;
        this.transformationLink = null;
    }
    bindOnClick(){
        this.click = false
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
            case'clickable':
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

export class ShrikeScene{
    constructor(geometryLayer,collisionLayer,clickableLayer,link){
        this.type = 'scene';
        this.geometryLayer = geometryLayer;
        this.collisionLayer = collisionLayer;
        this.clickableLayer = clickableLayer
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
    #shrikeCanvas
    #CANVAS_WIDTH
    #CANVAS_HEIGHT
    #activeLayer
    #perFrame = (e) => {throw new Error("perFrameUpdate function not implemented by user \n use bindPerFrameUpdateFunction method to provide function")}
    #fixedUpdate(e){}
    #center
    #lastUpdateTime
    #timeBuffer = 0
    tickrate = 100 // gamespeed 
    /**
     *  default tickrate is 100ms (10 ticks per second)
     *  
     * @param {HTMLCanvasElement} canvas - canvas element to draw on
     * @param {Number} #gameSpeed - modifies the time scaling of the engine
     * @param {Number} width - hint for what the width of the canvas should be
     * @param {Number} height - hint for what the height of the canvas should be
     */
    constructor(canvas,gameSpeed,width, height){
        this.#CANVAS_WIDTH = canvas.width =width;
        this.#CANVAS_HEIGHT = canvas.height = height;
        this.#shrikeCanvas = canvas; 
        this.tickrate = this.tickrate * gameSpeed;
        this.#activeLayer = null;
        this._shrikeLoop = this._shrikeLoop.bind(this);
        this.#center = {
            x: width/2,
            y: height/2,
        }
        this._shrikeInit();
        this.moduleList = [];
        this.#lastUpdateTime = performance.now()
    }
    setActiveLayer(activeLayer){
        this.#activeLayer = activeLayer;
    }  
    
    bindPerFrameFunction(perFrameFunction){
        this.#perFrame = perFrameFunction
    }

    _shrikeInit(){
        this.eventObject = new EventHandler(this.#shrikeCanvas);
        this.shrikeRenderer = new Renderer(this.#shrikeCanvas,this.#center);
        this.shrikeBehaviorHandler = new BehaviorHandler(this.#shrikeCanvas,this.eventObject);
        this.shrikeCollisionHandler = new CollisionHandler(this.eventObject) // AVRON: see what data u want here 
        // ngl this can be moved to the constructor itself (i forgot why i needed this prolly something related to dynamic module selection (there are better ways to do that ig aswell))  
    }
   

    _preprocess(){ 
        this._shrikeInit();
        this.shrikeRenderer.init(this.layers,this.textures); 
    }
    
    
    _templooptest(){ 
        this.#timeBuffer = this.#timeBuffer + performance.now() - this.#lastUpdateTime;
        while(this.#timeBuffer >= this.tickrate)
        {
            this.#fixedUpdate(this.eventObject)
            this.#timeBuffer -= this.tickrate
        }
        this.#lastUpdateTime = performance.now()
    }
    
    #lastFrameTime=0;
    #frameCount=0;
    #fps=0;
    _shrikeLoop = () => { 
        this.shrikeRenderer.loopFunction(this.#activeLayer);   
        this.shrikeCollisionHandler.loopFunction(this.#activeLayer);
        this.#perFrame(this.eventObject) // function should be overidden by user
        this._templooptest()

        requestAnimationFrame(this._shrikeLoop);
    }
          
    shrikeRun(){
        // pre game loop functions here
        this._shrikeLoop();
        //any cleanup maybe idk never used javascript
    }
}

