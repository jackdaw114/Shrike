export class SGuiText extends HTMLElement {
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.textId = SGuiText.nextId++;
        const defaultOptions = {
            value:0,
            customClasses: [],
            text:"text-" + this.textId
        }
        this.options = {...defaultOptions,...customOptions}
        const textDiv = document.createElement("div");
        textDiv.id = `text-${this.textId}`;
        //sliderDiv.id = `slider-${this.sliderId}`; // Assign a unique ID
        textDiv.classList.add(...this.options.customClasses,"sgui-base");
        this.appendChild(textDiv);
    
        const text = document.createElement("span");
        text.textContent =  this.options.text 
    
    
        textDiv.appendChild(text)
    
    }

}


export const sGuiChildList = [SGuiText]
