export class EventHandler {
    DRAG_THRESHOLD = 20
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
        this.isDragging = false
        this.dragStartPos={
            x:0,
            y:0
        }
        this.dragEndPos = {
            x:0,
            y:0
        }// relative to start
        this.rect = element.getBoundingClientRect();
        element.addEventListener('mousedown', (e)=>this.handleMouseDown(e));
        element.addEventListener('mouseup', (e) =>this.handleMouseUp(e));
        element.addEventListener('mousemove',(e)=>this.handleMouseMove(e))
        element.addEventListener('wheel',(e)=>this.handleScroll(e))
        document.body.addEventListener('keydown',(e)=>this.handleKeyDown(e)) 
        document.body.addEventListener('keyup',(e)=>this.handleKeyUp(e)) 
        element.addEventListener('dragstart', (e) => e.preventDefault());
        element.addEventListener('mouseleave', (e) => {
            this.mouseDown =false
        })
        document.addEventListener('mouseout',(e)=>{
            this.activeKeys ={}
        })
        document.addEventListener('blur',(e)=>{
            this.activeKeys ={}
        })
    }

    handleMouseDown(e) {
        this.isDragging = true
        this.mouseDown = e.buttons;
        this.lastX = e.clientX-this.rect.left;
        this.lastY = e.clientY-this.rect.top;
        this.dragStartPos = {
            x:e.clientX-this.rect.left,
            y:e.clientY-this.rect.top 
        };
        this.element.dispatchEvent(new CustomEvent("u_mousedown",{
            detail:{
                ...e,
                ...this.dragStartPos
            }
        }))
    }

    handleMouseUp(e) {
        this.mouseDown = false;
        this.dragEndPos={
            x:0,
            y:0
        }
        
        if (Math.hypot(this.dragEndPos.x,this.dragEndPos.y)<this.DRAG_THRESHOLD){
            this.element.dispatchEvent(new CustomEvent("click",{
                detail:e
            }))
        }
    }
    
    handleKeyDown(e) {
        this.activeKeys[e.key] = true
    }
    handleKeyUp(e) {
        delete this.activeKeys[e.key]
    }

    handleScroll(e) {
        e.preventDefault()
        this.element.dispatchEvent(new CustomEvent("u_scroll",  {
            detail:e
        })) 

    }
    handleMouseMove(e) {
        const dispX = e.clientX - this.lastX;
        const dispY = e.clientY - this.lastY;
        this.dragEndPos = {
            x:this.dragEndPos.x+dispX,
            y:this.dragEndPos.y+dispY
        }
        if (this.mouseDown && !Object.keys(this.activeKeys).length && Math.hypot(this.dragEndPos.x,this.dragEndPos.y)>this.DRAG_THRESHOLD) {
            this.element.dispatchEvent(new CustomEvent("drag", {
                detail: {
                    button: this.mouseDown,
                    originalEvent: e,
                    dispX,
                    dispY,
                    currentX: e.clientX,
                    currentY: e.clientY,
                    startX: this.lastX,
                    startY: this.lastY,
                    dragStartPos:this.dragStartPos,
                    dragEndPos:this.dragEndPos
                }
            }))    
            }

        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }


    destroy() {
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}
