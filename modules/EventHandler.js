export class EventSyncStack{ // this is for if we have to do stuff synchronously
    constructor(type){
        this.type = type;
        this.stack = 0;
    }
    pushStack(){
        this.stack++;
    }
    popStack(){
        this.stack--;
    }
    isEmpty(){
        return this.stack;
    }
}


export default class EventHandler{
    // im keeping 2 special events keypress and onclick
    /**
     *
     *
     */
    constructor(canvas,ticker,onKeyPressFunction,onClickFunction){
        this.canvas = canvas;
        this.quadrantData={x:0,y:0};
        this.mouseCoords = new DOMPoint(0,0)
        this.mouseX=0;
        this.mouseY=0;
        this.left_mouse_down=false;
        this.right_mouse_down=false;
        this.keydown={};
        this.onKeyPressFunctionList = []
        this.onClickFunctionList = []
        this.init()
    }


    handleClick(event){
        event.preventDefault();
        for(const onClickFunction of this.onClickFunctionList ){
            onClickFunction();
        }
    }

    addOnKeyPressFunction(onKeyPressFunciton){ // onKeyPressFunction should take argument event
        this.onClickFunction=onKeyPressFunciton;
    }
    
    init(){ 
        this.canvas.addEventListener('click',this.handleClick.bind(this))
        this.canvas.addEventListener('mousemove',this.handleMouseMove.bind(this))
        this.canvas.addEventListener('mousedown',this.handleMouseDown.bind(this))
        this.canvas.addEventListener('mouseup',this.handleMouseUp.bind(this))
        this.canvas.addEventListener('mouseout',this.handleMouseOut.bind(this))
        this.canvas.addEventListener('mouseover',this.handleMouseIn.bind(this))
        this.canvas.addEventListener('contextmenu',this.preventDefault.bind(this))
        window.addEventListener('keydown',this.handleKeyDown.bind(this))
        window.addEventListener('keyup',this.handleKeyUp.bind(this))
        window.addEventListener('keypress',this.handleKeyPress.bind(this))
    }
    
    preventDefault(event){
        event.preventDefault(); 
    }

    handledEvent(type){
        if(type == 'click'){
            this.click = false;
        }
        if(type == 'keypress'){
            this.keypress = null;
        }
    }

    handleMouseMove(event){
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect(); // handle all this stuff differently maybe dont need to check every move wether widow has changed
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        this.mouseX = (event.clientX - rect.left + scrollX)* scaleX - this.canvas.width/2;
        this.mouseY = this.canvas.height/2 - (event.clientY - rect.top + scrollY)* scaleY;
        this.mouseCoords.x = (event.clientX - rect.left + scrollX)* scaleX - this.canvas.width/2 
        this.mouseCoords.y = this.canvas.height/2 - (event.clientY - rect.top + scrollY)* scaleY;
    }

    handleKeyUp(event){
        event.preventDefault();
        this.keydown[event.key] = false;
    } 
    handleKeyDown(event){
        event.preventDefault();

        this.keydown[event.key] = true;
    }
    handleKeyPress(event){
        event.preventDefault();
        for(const keypressFunction in this.onKeyPressFunctionList){
            keypressFunction(event);
        }
    } 
    handleMouseIn(event){
        event.preventDefault();
        
    }
    handleMouseOut(event){
        event.preventDefault();

    }
    handleMouseDown(event){
        event.preventDefault();
        if(event.buttons === 1){
            this.left_mouse_down = true;
        }
        if(event.buttons === 2){
            this.right_mouse_down = true;
        }
    }
    handleMouseUp(event){
        event.preventDefault();
            this.left_mouse_down = false;
            this.right_mouse_down = false;
    }
    handleKeyPress(event){
        event.preventDefault();
        for(const keyPressFunction in this.onKeyPressFunctionList){
            keyPressFunction(event);
        }
    } 

    eventStatus(){
        return this.handled_status;
    }    
}
