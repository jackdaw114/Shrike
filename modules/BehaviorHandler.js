export class BehaviorHandler{
    constructor(canvas,eventObject ){
        this.eventObject = eventObject;        
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
        if(Layer.type == 'gate'){
            
            this._processLayer(Layer.behaviorLayer) // prolly later we have some different method of handling base layers
            
        } 

        else{
            for(const hitbox of Layer.array ){
                hitbox.onFrame(this.eventObject)  // collision detection ?
            }
        } 

        if(Layer.link != null){
            this._processLayer(Layer.link)
        }
    }

    loopFunction(activeLayer){
        this._processLayer(activeLayer);
    }
}


