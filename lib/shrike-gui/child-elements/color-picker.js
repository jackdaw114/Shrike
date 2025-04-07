import iro from "@jaames/iro";

export default class SGuiColorPicker extends HTMLElement {
    static nextId = 0;
    constructor(element, customOptions = {}) {
        super();
        this.element = element;
        this.id = "colorPicker-" + SGuiColorPicker.nextId++;


        // this.colorState = colorState;
        const defaultOptions = {
            colorState: null,
            customClasses: [],
            colorPickerWidth: 250,
            colorPickerPadding: 10
        }
        this.options = { ...defaultOptions, ...customOptions }
        const pickerDiv = document.createElement("div");

        pickerDiv.id = "picker"; // TODO: update this
        pickerDiv.classList.add(...this.options.customClasses, "sgui-color-picker", "sgui-base");
        this.appendChild(pickerDiv);
        this.iroRef = new iro.ColorPicker(pickerDiv, {
            width: this.options.colorPickerWidth,
            padding: this.options.colorPickerPadding,
        });
        this.iroRef.on("color:change", (color) => {
            console.log(color)
            this.element.dispatchEvent(new CustomEvent("color-change", {
                detail: {
                    id: this.id,
                    rgb: color.rgb
                }
            }))
        });
    }
}
