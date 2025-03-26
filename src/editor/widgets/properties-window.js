import SGuiDropDown from "../../../lib/shrike-gui/child-elements/drop-down";
import SGuiFilePanel from "../../../lib/shrike-gui/child-elements/file-panel";

export const createPropertiesWindow = (sgui, object) => {
    const propertiesWindow = {};
    let activeObj = {};
    propertiesWindow.mainWindow = sgui.createWindow("properties", true)
    
    propertiesWindow.object = object;
    propertiesWindow.components = [];
    document.addEventListener("set-active-object", (e) => {
        // if (activeObj === e.detail.entity) {
        //     return;
        // }
        activeObj = e.detail.entity;
        propertiesWindow.components = e.detail.entity.components;
        console.log("propertiesWindow.components  ",propertiesWindow.components)
        propertiesWindow.mainWindow.removeAllChildren()
        for (const key of Object.keys(propertiesWindow.components)) {
            console.log("key: ", key)
            if (["mainWindow","object","Transformation"].includes(key)) continue;
            propertiesWindow.mainWindow.appendChild(propertiesWindow[key])
            
        }

    })
    propertiesWindow.Geometry = new SGuiDropDown({heading:"Geometry"})
    propertiesWindow.Script = new SGuiDropDown({heading:"Script"})
    propertiesWindow.Script.filePanel = new SGuiFilePanel(propertiesWindow.Script,{type:"special"})
    propertiesWindow.Script.contentDiv.appendChild(propertiesWindow.Script.filePanel);
    propertiesWindow.Geometry.filePanel = new SGuiFilePanel(propertiesWindow.Geometry,{type:"special"})
    propertiesWindow.Geometry.contentDiv.appendChild(propertiesWindow.Geometry.filePanel);

    propertiesWindow.Script.filePanel.addEventListener("special-file-selected", (e) => {
        console.log("file-selected", e.detail.file)
    })
    propertiesWindow.Geometry.filePanel.addEventListener("special-file-selected", (e) => {
        console.log("file-selected", e.detail.file)
    })

    return propertiesWindow;
}