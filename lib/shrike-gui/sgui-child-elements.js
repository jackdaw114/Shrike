export class SGuiText extends HTMLElement {
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.textId = SGuiText.nextId;
        const defaultOptions = {
            value:0,
            customClasses: [],
            text:"text-" + this.textId
        }
        this.options = {...defaultOptions,...customOptions}
        const textDiv = document.createElement("div");
        textDiv.id = `text-${this.textId}`;
        textDiv.classList.add(...this.options.customClasses,"sgui-text");
        this.appendChild(textDiv);
    
        const text = document.createElement("span");
        text.textContent =  this.options.text 
    
        this.addEventListener("change-text", (e)=>{
            text.textContent = e.detail.text;
        }) 
        textDiv.appendChild(text)

        SGuiText.nextId++    
    }

}


export class SGuiContainer extends HTMLElement{
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        const defaultOptions = {
            heading:"heading container" + SGuiContainer.nextId

        }
        this.options = {...defaultOptions,...customOptions}

        this.textContent = this.options.heading

        this.id = SGuiContainer.nextId
         
        SGuiContainer.nextId++
    }
}

export const sGuiChildList = [SGuiText,SGuiContainer]
