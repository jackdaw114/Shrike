export class EventHandler {
    static instance = null;
    #batchInterval = 16;
    #eventListeners = new Map();
    #eventBatches = new Map();
    #batchTimeouts = new Map();

    constructor(element) {
        if (EventHandler.instance) {
            return EventHandler.instance;
        }
        this.canvas = element;
        this.elementBounds = element.getBoundingClientRect();
        EventHandler.instance = this;
    }

    batchHelper(eventType, eventData) {
        if (!this.#eventBatches.has(eventType)) {
            this.#eventBatches.set(eventType, []);
        }
        this.#eventBatches.get(eventType).push(eventData);
        if (!this.#batchTimeouts.has(eventType)) {
            this.#batchTimeouts.set(
                eventType,
                setTimeout(() => {
                    this.dispatchBatchEvent(eventType);
                }, this.#batchInterval)
            );
        }
    }

    dispatchBatchEvent(eventType) {
        const batch = this.#eventBatches.get(eventType);
        if (batch && batch.length > 0) {
            const lastEvent = batch[batch.length - 1];
            if (this.#eventListeners.has(eventType)) {
                for (let callback of this.#eventListeners.get(eventType)) {
                    callback(lastEvent);
                }
            }
        }
        this.#eventBatches.delete(eventType);
        this.#batchTimeouts.delete(eventType);
    }

    addEventListener(eventType, callback) {
        if (!this.#eventListeners.has(eventType)) {
            this.#eventListeners.set(eventType, new Set());
        }
        this.#eventListeners.get(eventType).add(callback);
    }

    removeEventListener(eventType, callback) {
        if (this.#eventListeners.has(eventType)) {
            this.#eventListeners.get(eventType).delete(callback);
        }
    }

    dispatchEvent(shrikeEvent) {
        if (this.#eventListeners.has(shrikeEvent.type)) {
            for (let callback of this.#eventListeners.get(shrikeEvent.type)) {
                callback(shrikeEvent);
            }
        }
    }
}



export class MouseEvent {
    constructor(element) {
        this.element = element;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.prevScrollY = 0;
        this.mouseDown = false;
        this.dragCallback = () => {};
        this.activeKeys ={}

        element.addEventListener('mousedown', (e)=>this.handleMouseDown(e));
        element.addEventListener('mouseup', (e) =>this.handleMouseUp(e));
        element.addEventListener('mousemove',(e)=>this.handleMouseMove(e))
        element.addEventListener('wheel',(e)=>this.handleScroll(e))
        document.body.addEventListener('keydown',(e)=>this.handleKeyDown(e)) 
        document.body.addEventListener('keyup',(e)=>this.handleKeyUp(e)) 
        element.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
        this.mouseDown = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    handleMouseUp(e) {
        this.mouseDown = false;
    }
    
    handleKeyDown(e) {
        this.activeKeys[e.key] = true
        console.log(this.activeKeys)
    }
    handleKeyUp(e) {
        delete this.activeKeys[e.key]
        console.log(this.activeKeys)
    }

    handleScroll(e) {
        e.preventDefault()
        this.scrollCallback(e)
        

    }
    handleMouseMove(e) {
    if (this.mouseDown && !Object.keys(this.activeKeys).length) {
            const dispX = e.clientX - this.lastX;
            const dispY = e.clientY - this.lastY;

            this.dragCallback({
                originalEvent: e,
                dispX,
                dispY,
                currentX: e.clientX,
                currentY: e.clientY,
                startX: this.lastX,
                startY: this.lastY
            });
        }

        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    addEventListener(type, callback) {
        if (type === 'drag') {
            this.dragCallback = callback;
        }
        if (type === 'scroll') {
            this.scrollCallback = callback;
        }
    }

    // Clean up method to remove event listeners
    destroy() {
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}
