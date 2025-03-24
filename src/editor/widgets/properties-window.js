import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiFilePanel from "../../../lib/shrike-gui/child-elements/file-panel";

export const createPropertiesWindow = (sgui, object) => {
    const propertiesWindow = {};

    propertiesWindow.mainWindow = sgui.createWindow("properties", true)
    propertiesWindow.object = object
    propertiesWindow.components = [];
    document.addEventListener("set-active-object", (e) => {
        propertiesWindow.components = e.detail.entity.components;
        console.log("propertiesWindow.components  ",propertiesWindow.components)
        for (const key of Object.keys(propertiesWindow.components)) {
            console.log("key: ", key)
            if (key === "Transformation") continue;
            if (["mainWindow","object"].includes(key)) continue;
            propertiesWindow.mainWindow.appendChild(propertiesWindow[key])
            propertiesWindow[key].contentDiv.appendChild(new SGuiFilePanel(propertiesWindow[key],{type:"special"}));
        }
    })
    propertiesWindow.Geometry = new SGuiDropDown({heading:"Geometry"})
    propertiesWindow.Script = new SGuiDropDown({heading:"Script"})

    return propertiesWindow;
}



