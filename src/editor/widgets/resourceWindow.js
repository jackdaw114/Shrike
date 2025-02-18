import SGuiFilePanel from "../../../lib/shrike-gui/child-elements/file-panel";

export const createResourceWindow = (element,sgui) => {
    const resourceWindow = {};

    resourceWindow.mainWindow = sgui.createWindow("Resource Window",true)

    resourceWindow.filePanel = new SGuiFilePanel(element)

    resourceWindow.mainWindow.append(resourceWindow.filePanel)
    return resourceWindow;
}
