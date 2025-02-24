export default class SGuiDropDown extends HTMLElement {
    static nextId = 0;
    constructor(customOptions = {}) {
        super();
        this.isOpen = true
        const defaultOptions = {
            heading: SGuiDropDown.nextId
        }
        this.options = {...defaultOptions,...customOptions}
        this.toggleDiv = document.createElement("div")         
        this.toggleDiv.style.minHeight = "1em"
        this.toggleDiv.style.backgroundColor = "#111720" // set value
        this.toggleDiv.textContent = this.options.heading
        this.toggleDiv.style.userSelect = "none"
        this.contentDiv = document.createElement("div")
        this.toggleDiv.addEventListener("click",(e)=>{
            if (this.isOpen){
                console.log("closing")
                this.isOpen = !this.isOpen
                this.contentDiv.style.height = "0em"
            }
            else{
                this.isOpen = !this.isOpen
                this.contentDiv.style.height ="auto"
            }
        })
        this.appendChild(this.toggleDiv)
        this.appendChild(this.contentDiv)

        this.appendChild = (element)=>{
        this.contentDiv.appendChild(element)
        }
        SGuiDropDown.nextId++
    }
}