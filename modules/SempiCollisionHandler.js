class XDVector{  // decrease precision (too precice waste of computation)
    constructor(x,y){
        if(x instanceof DOMPoint){
            this.x = x.x
            this.y = x.y
        }
        else{
        this.x = x
        this.y = y
        }
    }
    static subtract(vecA,vecB){
        return {x:vecA.x - vecB.x,y:vecA.y-vecB.y}
    }
    abs(){
        return{
            x: this.x < 0 ? -this.x : this.x,
            y: this.y < 0 ? -this.y : this.y,
        }
    }
    static XDlength(vecA,vecB){
        if(vecB == null)
        {
            vecB = {x:0,y:0}
        }
        return Math.sqrt(Math.pow(vecA.x-vecB.x,2)+Math.pow(vecA.y-vecB.y,2))
    }
    static XDmax(vecA,vecB){
       return {
           x:(vecA.x > vecB.x) ? vecA.x:vecB.x,
           y:(vecA.y > vecB.y) ? vecA.y:vecB.y
       } 
    }
}

export class CollisionHandler{
    constructor(eventObject){
        this.eventObject =eventObject
    }
    #loadHitboxLayer(shrikeLayer){ // could be of type base(should be but freedom given) or collision
        if(shrikeLayer.type == 'gate'){  // check if javascript instanceof is faster (in my head it cannot be)
            this.#loadHitboxLayer(shrikeLayer.collisionLayer)
        }
        else if(shrikeLayer.type == 'collision'){
            counter = 0;
            for(const hitbox in shrikeLayer.array){
                       
            }
        }
    }
    
    #detectCollision(shrikeLayer){
        shrikeLayer.array.forEach((hitbox,index)=>{
            if(hitbox.type == 'rectangle'){
                                      
            } 
        })

    }
     

    #sdfBox(pBox,pPoint){
        // box always at origin
        // implement vector 2d library if this is a thing (fk me lol)
        let distance = XDVector.subtract(pPoint.abs(),pBox)
        return XDVector.XDlength(XDVector.XDmax(distance,{x:0,y:0}))
    } 

    #processClick(shrikeLayer){
        if(shrikeLayer.type !='clickable')
        {
            throw new Error("not a clickable layer")
        }
        shrikeLayer.array.forEach((hitbox,index)=>{
            const transformationObject = hitbox.transformationLink
            if(hitbox.type == 'rectangle'){


                if(this.eventObject.left_mouse_down){
                const distance = this.#sdfBox({x:hitbox.params.width/2,y:hitbox.params.height/2},new XDVector(this.eventObject.mouseCoords.matrixTransform(transformationObject.matrix.inverse())))
            
                if(distance == 0){
                    hitbox.click=true
                }
                else{
                    hitbox.click=false
                    }
            }
                else{
                    hitbox.click=false
                }
            }
            
        })
    }

    _init(){
           
    }
    loopFunction(shrikeLayer){
        if(shrikeLayer.type == 'gate')
        this.#processClick(shrikeLayer.clickableLayer)
    }
}
