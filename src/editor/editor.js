/*
 * TODO:-
 * gui handling
 * serialization
 */

import {Shrike} from "../core/core";
import {Scene} from "../ecs/classes";


const runtime = new Shrike();
const editor = new Scene();

const game = [] //scenes of regestered??


runtime.addScene(editor, "editor")
runtime.start()
