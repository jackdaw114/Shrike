import Renderer from "./src/graphics/renderer.js"

let canvas = document.getElementById("canvas1")


const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight; 

let renderer_t = new Renderer(canvas)
const vertices = new Float32Array([ // define points here 
    0.0,  0.5,  // Vertex 1 (x, y)
    -0.5, -0.5,  // Vertex 2 (x, y)
    0.5, -0.5,  // Vertex 3 (x, y)
    0.2,0.2
]); 

const indices = new Uint16Array([
    0,1,2,0,2,3
])
renderer_t.test(vertices,indices)
