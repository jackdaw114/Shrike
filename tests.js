
import SGui, { SGuiFilePanel, SGuiSlider } from "./lib/shrike-gui/sgui";


import "./src/editor/editor.js"

customElements.define("s-gui", SGui)
const sguiInstance = new SGui();




let panelWindow = sguiInstance.createWindow("panel1", true)
let panelWindow2 = sguiInstance.createWindow("panel2", true)
let sliderWindow = sguiInstance.createWindow("slider", true)
let slider = new SGuiSlider(sliderWindow);
let slider2 = new SGuiSlider(sliderWindow);
let filePanel = new SGuiFilePanel(panelWindow);
let filePanel2 = new SGuiFilePanel(panelWindow2);


panelWindow.appendChild(filePanel);
panelWindow2.appendChild(filePanel2);
sliderWindow.appendChild(slider)
sliderWindow.appendChild(slider2)


// sguiInstance.destroy();


// ********************* END *************************


