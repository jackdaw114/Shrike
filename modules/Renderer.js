export default class Renderer{
    constructor(canvas, center){
        this.canvas = canvas
        this.context = canvas.getContext("2d") 
        this.center = center
        this.offScreenCanvas = document.createElement('canvas')
        this.offScreenCtx = this.offScreenCanvas.getContext('2d')
        this.offScreenCanvas.width = canvas.width;
        this.offScreenCanvas.height = canvas.height;
        this.offScreenCtx.translate(center.x,center.y)
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
                let t_matrix = object.transformationLink.getMatrix();
                this.offScreenCtx.transform(t_matrix[0],t_matrix[1],t_matrix[3],t_matrix[4],t_matrix[6],t_matrix[7])
                this.offScreenCtx.fillStyle = object.params.color
                if(object.type == 'rectangle')
                {
                    this._drawRect(object.params,this.offScreenCtx)
                }
                this.offScreenCtx.fillStyle = '#000000'
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

    _drawRect(params,ctx){
        if(params.texture != null){
            ctx.drawImage(params.texture.params.img,-params.width/2,-params.height/2,params.width,params.height)
        }
        else{
            ctx.fillRect(-params.width/2,-params.height/2,params.width,params.height) 
        }

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
