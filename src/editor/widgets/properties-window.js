import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";

export const createPropertiesWindow = (sgui,object) => {
    const propertiesWindow = {};

    propertiesWindow.mainWindow = sgui.createWindow("properties",true)
    propertiesWindow.object = object 
    propertiesWindow.geometryDropDown = new SGuiDropDown({heading:"geometry"})
    propertiesWindow.scriptDropDown = new SGuiDropDown({heading:"script"})

    for (const key of Object.keys(propertiesWindow)) {
        if (["mainWindow","object"].includes(key)) continue;
        propertiesWindow.mainWindow.appendChild(propertiesWindow[key]);
    }
    return propertiesWindow;
}



