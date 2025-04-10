import { Component } from "../classes";

export class GuiComponent extends Component {
    /**
     * @param {String} title
     * @param {Object} controller
     * @param {Boolean} isOpen
     */
    constructor(title, controller, isOpen) {
        super();
        this.controller = controller;
        this.handle;
        this.isOpen = isOpen;
        this.title = title;
    }
} 