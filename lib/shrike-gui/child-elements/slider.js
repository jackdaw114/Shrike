export default class SGuiSlider extends HTMLElement {
    static nextId = 0;
    constructor(element = null, customOptions = {}) {
        super();
        // this.label = label;
        this.element = element;

        this.id = "slider-" + SGuiSlider.nextId++;

        const defaultOptions = {
            sliderState: { value: 0 },
            customClasses: [],
            label: "",
        }
        this.options = { ...defaultOptions, ...customOptions }


        // Create a container div for the slider
        const sliderDiv = document.createElement("div");
        sliderDiv.id = `sliderDiv-${this.id}`; // Assign a unique ID
        sliderDiv.classList.add(...this.options.customClasses, "sgui-slider", "sgui-base");
        this.appendChild(sliderDiv);

        // Create the label
        const labelDiv = document.createElement("div");
        labelDiv.classList.add("slider-label");
        labelDiv.textContent = this.options.label || `Slider ${this.id}`;
        sliderDiv.appendChild(labelDiv);

        // Create the range input
        const sliderInput = document.createElement("input");
        sliderInput.type = "range";
        sliderInput.min = "0";
        sliderInput.max = "100";
        sliderInput.value = this.options.sliderState.value || "50";
        sliderInput.classList.add("slider-input");

        // Create a display for the current slider value
        const valueDisplay = document.createElement("div");
        valueDisplay.classList.add("slider-value-display");
        valueDisplay.textContent = sliderInput.value;

        // Append the slider input and value display to the slider container
        sliderDiv.appendChild(sliderInput);
        sliderDiv.appendChild(valueDisplay);

        this.state = new Proxy({
            value: 0,
        },
            {
                set(target, property, value) {
                    target[property] = value;
                    console.log("slider set",property)
                    if (property === "value") {
                        sliderInput.value = value; 
                    }
                    return true
                }
            }
        )
        // Add event listener for the slider input
        sliderInput.addEventListener("input", (event) => {
            this.state.value = event.target.value;
            // Update state
            //this.options.sliderState.value = value;

            // Update the value display
            valueDisplay.textContent = this.state.value;

            console.log(this.element)
            // Dispatch event
            this.element.dispatchEvent(
                new CustomEvent("slider-change", {
                    detail: { value:this.state.value, id: this.id },
                    bubbles: true,
                    composed: true,
                })
            );
        });
    }
    setValue(value) {
        this.state.value = value
    }
}



