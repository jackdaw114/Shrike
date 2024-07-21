export class EventSyncStack{
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
    constructor(canvas,onKeyPressFunction,onClickFunction){
        this.canvas = canvas;
        this.mouse_x=0;
        this.mouse_y=0;
        this.left_mouse_down=false;
        this.right_mouse_down=false;
        this.keydown=null;
        this.onKeyPressFunctionList = []
        this.onClickFunctionList = []
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
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        console.log(rect)
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        this.mouse_x = (event.clientX - rect.left + scrollX)* scaleX;
        this.mouse_y = (event.clientY - rect.top + scrollY)* scaleY;
        console.log(this)
    }

    handleKeyUp(event){
        event.preventDefault();
        this.keydown = null;
    } 
    handleKeyDown(event){
        event.preventDefault();

        this.keydown = {key: event.key,keyCode:event.keyCode};
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
        if(event.button === 1){
            this.left_mouse_down = true;
        }
        if(event.button === 2){
            this.right_mouse_down = true;
        }
        console.log("down")
    }
    handleMouseUp(event){
        event.preventDefault();
        if(event.button === 1){
            this.left_mouse_down = false;
        }
        if(event.button === 2){
            this.right_mouse_down = false;
        }
        console.log("up")
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
            
    
// bind canvas events 
// provide custom event bind for objects 

    
          

}



