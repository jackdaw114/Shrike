export default class Renderer{
    constructor(canvas, center){
        this.canvas = canvas
        this.context = canvas.getContext("2d") 
        this.center = center
        this.offScreenCanvas = document.createElement('canvas')
        this.offScreenCtx = this.offScreenCanvas.getContext('2d')
        this.offScreenCanvas.width = canvas.width;
        this.offScreenCanvas.height = canvas.height;
        this.offScreenCtx.scale(1,-1)
        this.offScreenCtx.translate(center.x,-center.y)
        this.offScreenCtx.imageSmoothingEnabled = true;
        this.context.imageSmoothingEnabled =true
    }
    
    _layerDamage(){
        //  TODO: optimization for base layer redrawing 
    }
    init(object_array){
        this._initLayers()
    }
  
    _renderLayer(Layer){
        if(Layer.type == 'gate')
        {
            this.offScreenCtx.clearRect(-this.center.x,-this.center.y,2*this.center.x,2*this.center.y)
            this._renderLayer(Layer.geometryLayer)
        }
        else { 
            for (const object of Layer.array){
                // call _transformationStack here
                this.offScreenCtx.save() 
                let t_matrix = object.transformationLink.matrix;
                this.offScreenCtx.transform(t_matrix.a,t_matrix.b,t_matrix.c,t_matrix.d,t_matrix.e,t_matrix.f)
                this.offScreenCtx.fillStyle = object.params.color
                if(object.type == 'rectangle'){
                    this._drawRect(object.params,this.offScreenCtx)
                }
                else if(object.type == 'circle'){
                    this._drawCircle(object.params,this.offScreenCtx)
                }
                this.offScreenCtx.restore(); 

            }
        }
    }


    _initLayers(){ // do later for optimization
        for ( const layer of this.layer_list){
            this._initObjects(layer.params.behaviorLayer) 
        } 
    } 

    _initObjects(overlayLayer){
        for(const object of behaviorLayer.params.object_array)
        {
            
        }
    }
    _transformationStack(transformation){
        // code here for multi transforamtions
        return 0;
    } 


    _drawRect(params,ctx){ ctx.fillRect(-params.width/2,-params.height/2,params.width,params.height) }



    _drawImage(params,ctx){
        ctx.drawImage(params.texture.params.img,-params.width/2,-params.height/2,params.width,params.height) 
    }
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    _drawCircle(params,ctx){
        ctx.beginPath()
        ctx.arc(0,0,params.r,0,2*Math.PI)
        ctx.fill()
        ctx.closePath()
    }
    

    _render(geometryLayer){
        for(const object of geometryLayer.object_array){
            if(object.type == 'rectangle')
                this._drawRect(object.params,object.transformation)
            else if(object.type == 'circle'){
                this._drawCircle(object.params, object.transformation)
            }
            if ('link' in object){
                this._renderTexture(object.link);
            }
        }
        
    } 

    loopFunction(activeLayer){
        this._renderLayer(activeLayer);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height)
        this.context.drawImage(this.offScreenCanvas,0,0)
    }

}
