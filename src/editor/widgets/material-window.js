import SGuiSlider from "../../../lib/shrike-gui/child-elements/slider";
import SGuiContainer from "../../../lib/shrike-gui/child-elements/container";
import SGuiColorPicker from "../../../lib/shrike-gui/child-elements/color-picker";

// Custom dropdown implementation
class MaterialDropdown extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.attachShadow({ mode: 'open' });
        
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                margin-bottom: 8px;
            }
            .dropdown-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background-color: #2a3441;
                border-radius: 4px;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s ease;
            }
            .dropdown-header:hover {
                background-color: #364150;
            }
            .dropdown-header.active {
                background-color: #445267;
            }
            .dropdown-content {
                padding: 8px;
                background-color: #212730;
                border-radius: 0 0 4px 4px;
                display: none;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
            }
            .dropdown-content.open {
                display: block;
            }
            .arrow {
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid #fff;
                transition: transform 0.2s ease;
            }
            .arrow.open {
                transform: rotate(180deg);
            }
            .title {
                color: #fff;
                font-size: 0.9em;
                font-weight: 500;
            }
        `;
        
        this.shadowRoot.appendChild(style);
        
        const header = document.createElement('div');
        header.className = 'dropdown-header';
        
        const title = document.createElement('span');
        title.className = 'title';
        title.textContent = this.getAttribute('heading') || '';
        
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        
        header.appendChild(title);
        header.appendChild(arrow);
        
        const content = document.createElement('div');
        content.className = 'dropdown-content';
        
        this.shadowRoot.appendChild(header);
        this.shadowRoot.appendChild(content);
        
        header.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            content.classList.toggle('open', this.isOpen);
            header.classList.toggle('active', this.isOpen);
            arrow.classList.toggle('open', this.isOpen);
        });
        
        this.appendChild = (element) => {
            content.appendChild(element);
        };

        // Observe attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'heading') {
                    title.textContent = this.getAttribute('heading') || '';
                }
            });
        });
        observer.observe(this, { attributes: true });
    }
}

customElements.define('material-dropdown', MaterialDropdown);

export const createMaterialWindow = (editor, sgui, canvas) => {
    const materialWindow = {
        mainWindow: sgui.createWindow("Material", true),
        // Shared color picker
        colorPicker: new SGuiColorPicker(canvas, { size: 150 }), // Reduced size
        
        // Diffuse color controls
        diffuseDropDown: new MaterialDropdown(),
        diffuseR: new SGuiSlider(canvas, { value: 0, max: 255 }),
        diffuseG: new SGuiSlider(canvas, { value: 0, max: 255 }),
        diffuseB: new SGuiSlider(canvas, { value: 0, max: 255 }),
        
        // Ambient color controls
        ambientDropDown: new MaterialDropdown(),
        ambientR: new SGuiSlider(canvas, { value: 0, max: 255 }),
        ambientG: new SGuiSlider(canvas, { value: 0, max: 255 }),
        ambientB: new SGuiSlider(canvas, { value: 0, max: 255 }),
        
        // Specular color controls
        specularDropDown: new MaterialDropdown(),
        specularR: new SGuiSlider(canvas, { value: 0, max: 255 }),
        specularG: new SGuiSlider(canvas, { value: 0, max: 255 }),
        specularB: new SGuiSlider(canvas, { value: 0, max: 255 }),
        
        // Shininess control
        shininessDropDown: new MaterialDropdown(),
        shininessSlider: new SGuiSlider(canvas, { value: 1, max: 100, min: 1 }),

        // Track active color type
        activeColorType: 'diffuse', // Default to diffuse
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .material-window {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px;
            background-color: #1a222b;
        }
        .color-picker-container {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
            padding: 12px;
            background-color:rgb(0, 3, 6);
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            background-color: #212730;
            border-radius: 4px;
        }
        .slider-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .slider-label {
            min-width: 20px;
            text-align: right;
            color: #fff;
            font-size: 0.9em;
        }
        .active {
            background-color: #445267;
        }
    `;
    materialWindow.mainWindow.appendChild(style);

    // Set dropdown headings
    materialWindow.diffuseDropDown.setAttribute('heading', 'Diffuse Color (Base Color)');
    materialWindow.ambientDropDown.setAttribute('heading', 'Ambient Color (Shadow Color)');
    materialWindow.specularDropDown.setAttribute('heading', 'Specular Color (Highlight Color)');
    materialWindow.shininessDropDown.setAttribute('heading', 'Shininess (Specular Intensity)');

    // Create container for the color picker
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = 'color-picker-container';
    colorPickerContainer.appendChild(materialWindow.colorPicker);
    materialWindow.mainWindow.appendChild(colorPickerContainer);

    // Setup the color panel with dropdown
    const setupColorPanel = (dropDown, r, g, b) => {
        const container = document.createElement('div');
        container.className = 'slider-container';
        
        const createSliderRow = (label, slider) => {
            const row = document.createElement('div');
            row.className = 'slider-row';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'slider-label';
            labelSpan.textContent = label;
            row.appendChild(labelSpan);
            row.appendChild(slider);
            return row;
        };

        container.appendChild(createSliderRow('R:', r));
        container.appendChild(createSliderRow('G:', g));
        container.appendChild(createSliderRow('B:', b));
        
        dropDown.appendChild(container);
        materialWindow.mainWindow.appendChild(dropDown);
    };

    // Setup all panels
    setupColorPanel(materialWindow.diffuseDropDown, materialWindow.diffuseR, materialWindow.diffuseG, materialWindow.diffuseB);
    setupColorPanel(materialWindow.ambientDropDown, materialWindow.ambientR, materialWindow.ambientG, materialWindow.ambientB);
    setupColorPanel(materialWindow.specularDropDown, materialWindow.specularR, materialWindow.specularG, materialWindow.specularB);

    // Setup shininess panel
    const shininessContainer = document.createElement('div');
    shininessContainer.className = 'slider-container';
    shininessContainer.appendChild(materialWindow.shininessSlider);
    materialWindow.shininessDropDown.appendChild(shininessContainer);
    materialWindow.mainWindow.appendChild(materialWindow.shininessDropDown);

    // Add class to main window
    materialWindow.mainWindow.classList.add('material-window');

    // Function to update color picker based on active color type
    const updateColorPicker = () => {
        if (editor.activeObjects.length === 0) return;
        const geometry = editor.activeObjects[0].getComponent("Geometry");
        let rgb;

        switch (materialWindow.activeColorType) {
            case 'diffuse':
                rgb = geometry.material.diffuseColor.map(val => val * 255);
                break;
            case 'ambient':
                rgb = geometry.material.ambientColor.map(val => val * 255);
                break;
            case 'specular':
                rgb = geometry.material.specularColor.map(val => val * 255);
                break;
        }

        if (rgb) {
            materialWindow.colorPicker.iroRef.color.rgb = { r: rgb[0], g: rgb[1], b: rgb[2] };
        }
    };

    // Handle slider changes
    canvas.addEventListener("slider-change", (e) => {
        if (editor.activeObjects.length === 0) return;
        const geometry = editor.activeObjects[0].getComponent("Geometry");

        const updateColor = (r, g, b, colorType) => {
            const rgb = {
                r: r.getValue(),
                g: g.getValue(),
                b: b.getValue(),
            };
            materialWindow.colorPicker.iroRef.color.rgb = rgb;
            
            // Update the material color
            const normalized = [rgb.r, rgb.g, rgb.b].map(val => val / 255);
            switch (colorType) {
                case 'diffuse':
                    geometry.material.diffuseColor = normalized;
                    break;
                case 'ambient':
                    geometry.material.ambientColor = normalized;
                    break;
                case 'specular':
                    geometry.material.specularColor = normalized;
                    break;
            }
        };

        switch (e.detail.id) {
            case materialWindow.diffuseR.id:
            case materialWindow.diffuseG.id:
            case materialWindow.diffuseB.id:
                updateColor(materialWindow.diffuseR, materialWindow.diffuseG, materialWindow.diffuseB, 'diffuse');
                break;
            case materialWindow.ambientR.id:
            case materialWindow.ambientG.id:
            case materialWindow.ambientB.id:
                updateColor(materialWindow.ambientR, materialWindow.ambientG, materialWindow.ambientB, 'ambient');
                break;
            case materialWindow.specularR.id:
            case materialWindow.specularG.id:
            case materialWindow.specularB.id:
                updateColor(materialWindow.specularR, materialWindow.specularG, materialWindow.specularB, 'specular');
                break;
            case materialWindow.shininessSlider.id:
                geometry.material.shininess = e.detail.value;
                break;
            default:
                console.log("invalid window id:", e.detail.id);
        }
    });

    // Handle color picker changes
    canvas.addEventListener("color-change", (e) => {
        if (editor.activeObjects.length === 0) return;
        if (e.detail.id !== materialWindow.colorPicker.id) return;

        const geometry = editor.activeObjects[0].getComponent("Geometry");
        const rgb = e.detail.rgb;
        const normalized = [rgb.r, rgb.g, rgb.b].map(val => val / 255);

        // Update the material based on active color type
        switch (materialWindow.activeColorType) {
            case 'diffuse':
                geometry.material.diffuseColor = normalized;
                materialWindow.diffuseR.setValue(rgb.r);
                materialWindow.diffuseG.setValue(rgb.g);
                materialWindow.diffuseB.setValue(rgb.b);
                break;
            case 'ambient':
                geometry.material.ambientColor = normalized;
                materialWindow.ambientR.setValue(rgb.r);
                materialWindow.ambientG.setValue(rgb.g);
                materialWindow.ambientB.setValue(rgb.b);
                break;
            case 'specular':
                geometry.material.specularColor = normalized;
                materialWindow.specularR.setValue(rgb.r);
                materialWindow.specularG.setValue(rgb.g);
                materialWindow.specularB.setValue(rgb.b);
                break;
        }
    });

    // Add click handlers to dropdowns to make them active
    const dropdowns = {
        diffuse: materialWindow.diffuseDropDown,
        ambient: materialWindow.ambientDropDown,
        specular: materialWindow.specularDropDown
    };

    Object.entries(dropdowns).forEach(([type, dropdown]) => {
        dropdown.shadowRoot.querySelector('.dropdown-header').addEventListener('click', () => {
            // Remove active class from all dropdowns
            Object.values(dropdowns).forEach(d => {
                d.shadowRoot.querySelector('.dropdown-header').classList.remove('active');
            });
            // Add active class to clicked dropdown
            dropdown.shadowRoot.querySelector('.dropdown-header').classList.add('active');
            // Update active color type
            materialWindow.activeColorType = type;
            // Update color picker
            updateColorPicker();
        });
    });

    // Set initial active dropdown
    materialWindow.diffuseDropDown.shadowRoot.querySelector('.dropdown-header').classList.add('active');

    // Add update method
    materialWindow.updateActiveMaterial = (diffuseColor, ambientColor, specularColor, shininess) => {
        if (editor.activeObjects.length === 1) {
            const geometry = editor.activeObjects[0].getComponent("Geometry");
            geometry.materialOptions({
                diffuseColor,
                ambientColor,
                specularColor,
                shininess,
            });

            // Update UI to reflect new values
            const updateColorControls = (color, r, g, b) => {
                const rgb = color.map(val => val * 255);
                r.setValue(rgb[0]);
                g.setValue(rgb[1]);
                b.setValue(rgb[2]);
            };

            updateColorControls(diffuseColor, materialWindow.diffuseR, materialWindow.diffuseG, materialWindow.diffuseB);
            updateColorControls(ambientColor, materialWindow.ambientR, materialWindow.ambientG, materialWindow.ambientB);
            updateColorControls(specularColor, materialWindow.specularR, materialWindow.specularG, materialWindow.specularB);
            materialWindow.shininessSlider.setValue(shininess);

            // Update color picker to show current active color
            updateColorPicker();
        }
    };

    return materialWindow;
};