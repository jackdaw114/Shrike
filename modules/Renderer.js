export default class Renderer{
    constructor(canvas,layer_list, center){
        this.context = canvas.getContext("2d") 
        this.layer_list = layer_list
        this.center = center
        this.context.translate(center.x,center.y)
        this.context.save();
    }
    _layerDamage(){
        //  TODO: optimization for base layer redrawing 
    }
    init(object_array){
        this._initLayers()
    }
  
    _renderLayer(Layer){
        if(Layer.link?.params?.damaged)
        {
            _renderLayer(Layer.link)
        }
        // for each obj in a layer render object 
        for (const object of Layer.params.object_array){
            // call _transformationStack here
            let t_matrix = object.transformation.params;
            t_matrix.translate(100,50)
            t_matrix = t_matrix.matrix
            console.log(t_matrix)
             
            this.context.transform(t_matrix[0],t_matrix[1],t_matrix[3],t_matrix[4],t_matrix[6],t_matrix[7])
            if(object.type == 'geometry'){
                this.context.fillStyle = object.params.color
                if(object.subtype == 'rectangle')
                {
                    this._drawRect(object.params)  
                }
                this.context.fillStyle = '#000000'
            
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
        _renderLayer(activeLayer);
    }

}
