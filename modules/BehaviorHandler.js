export class BehaviorHandler{
    constructor(canvas,eventObject ){
        
    }

    // transformation object code
    // collision object (layer wise)
    // possibly texture aswell here
     

    
   // assign click to a certian layer and then certian object in layer 
    //use layer stack   
    _processLayer(Layer){
        if(Layer.type == 'base'){
            return 0; // prolly later we have some different method of handling base layers
        } 

        

        if(Layer.link != null){
            this._processLayer(Layer.link)
        }
    }

    loopFunction(activeBehaviorLayer){
        this._processLayer(activeBehaviorLayer);
    }
}

class CollisionHandler{

}
