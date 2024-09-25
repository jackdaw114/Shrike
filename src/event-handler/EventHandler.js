export class EventHandler{
    #batchInterval = 16; 
    #eventListeners = new Map()
    #eventBatches = new Map()
    #batchTimeouts = new Map()
    constructor(element){
        this.canvas = element
        this.elementBounds = element.getBoundingClientRect();
    } 
   

    batchHelper(eventType,eventData){
        if(!this.#eventBatches.has(eventType)){
            this.#eventBatches.set(eventType,[])
        }
        this.#eventBatches.get(eventType).push(eventData)
        if(!this.#batchTimeouts.has(eventType)){
            this.#batchTimeouts.set(eventType,setTimeout(()=>{
                this.dispatchBatchEvent(eventType)
            },this.#batchInterval))
        }

    }

    dispatchBatchEvent(eventType){
        const batch = this.#eventBatches.get(eventType);
        if(batch && batch.length >0){
            const lastEvent = batch[batch.length -1]
            if(this.#eventListeners.has(eventType)){
                for(let callback of this.#eventListeners.get(eventType))
                {
                    callback(lastEvent)
                }
            }
        }
        this.#eventBatches.delete(eventType)
        this.#batchTimeouts.delete(eventType)
    }

    addEventListener(eventType,callback){
        if(!this.#eventListeners.has(eventType)){
            this.#eventListeners.set(eventType,new Set())
        }
        this.#eventListeners.get(eventType).add(callback)
    }
    
    removeEventListener(eventType,callback){
        if(this.#eventListeners.has(eventType)){
            this.#eventListeners.get(eventType).delete(callback);
        }
    }

    dispatchEvent(shrikeEvent){
        if(this.#eventListeners.has(shrikeEvent.type)){
            for(let callback of this.#eventListeners.get(shrikeEvent.type)){
                callback(shrikeEvent)
            }
        }
    }
}
