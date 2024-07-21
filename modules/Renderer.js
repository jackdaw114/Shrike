export default class Renderer{
    constructor(canvas, center){
        this.context = canvas.getContext("2d") 
        this.center = center
        this.context.translate(center.x,center.y)
    }
    
    _layerDamage(){
        //  TODO: optimization for base layer redrawing 
    }
    init(object_array){
        this._initLayers()
    }
  
    _renderLayer(Layer){
        if(Layer.subtype == 'base')
        {
            this.context.clearRect(-this.center.x,-this.center.y,2*this.center.x,2*this.center.y)
            this._renderLayer(Layer.params.geometryLayer)
        }
        else if(Layer.subtype == 'geometry'){ 
            if(Layer.link?.params?.damaged)
            {
                this._renderLayer(Layer.link)
            }
            // for each obj in a layer render object 
            for (const object of Layer.params.object_array){
                // call _transformationStack here
                this.context.save() 
                let t_matrix = object.transformation.params;
                t_matrix = t_matrix.matrix
                this.context.transform(t_matrix[0],t_matrix[1],t_matrix[3],t_matrix[4],t_matrix[6],t_matrix[7])
                if(object.type == 'render'){
                    this.context.fillStyle = object.params.color
                    if(object.subtype == 'rectangle')
                    {
                        this._drawRect(object.params)  
                    }
                    this.context.fillStyle = '#000000'
                }
                this.context.restore(); 

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
    _drawRect(params){

        if(params.texture != null){
            this.context.drawImage(params.texture.params.img,-params.width/2,-params.height/2,params.width,params.height)
        }
        else{
        this.context.fillRect(-params.width/2,-params.height/2,params.width,params.height) 
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
    }

}
