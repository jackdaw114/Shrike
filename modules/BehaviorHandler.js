export class BehaviorHandler{
    constructor(canvas,eventObject ){
        this.eventObject = eventObject;        
        console.log(this.eventObject)
    }

    // transformation object code
    // collision object (layer wise)
    // possibly texture aswell here

    _loader(){
        // function list creation?
    }

    
    _processCollisionObject(shrikeObject){
        
    }
    _processObject(shrikeObject){

    }
    
   // assign click to a certian layer and then certian object in layer 
    //use layer stack   
    _processLayer(Layer){
        if(Layer.subtype == 'base'){
            
            this._processLayer(Layer.params.behaviorLayer) // prolly later we have some different method of handling base layers
            
        } 

        else if(Layer.subtype == 'behavior'){
            for(const hitbox of Layer.params.hitbox_array ){
                hitbox.onFrame(this.eventObject)  // collision detection ?
            }
            for(const transformationObject of Layer.params.transformation_array){
                transformationObject.onFrame(this.eventObject) 
            }
        } 

        if(Layer.link != null){
            this._processLayer(Layer.link)
        }
    }

    loopFunction(activeBehaviorLayer){
        this._processLayer(activeBehaviorLayer);
    }
}


