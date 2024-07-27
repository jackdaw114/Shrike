class XDVector{  // DONT LOOK AT reason: helper class specific to my logic 
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
    constructor(eventObject){ // this can be whatever data u want (can modify core to accomodate)
        this.eventObject =eventObject // gets global events (check event handler for all events)
    }
    
     

    #sdfBox(pBox,pPoint){ // DONT LOOK AT reason: collision logic (dont use this this is a rendering technique disguised as collision detection for rectangles (should be really fast tho but im lazy to search whats an actual collision detection technique) )
        let distance = XDVector.subtract(pPoint.abs(),pBox)
        return XDVector.XDlength(XDVector.XDmax(distance,{x:0,y:0}))
    } 

    #processClick(shrikeLayer){ // DONT LOOK AT reason: my logic its really bad cause event updation is not done correctly (all in one function (on click does mouse move out, mouse move in,mouse click, mouse release)) 
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

    _init(){ // special function available if any preprocessing (just before game loop starts) needs to be done (only called by the core)
           
    }
    loopFunction(shrikeLayer){ // this is the loop thats called every frame (ill switch it to every tick but fo now it eez wat it eez)
        if(shrikeLayer.type == 'gate')
        this.#processClick(shrikeLayer.clickableLayer)
    }
}
