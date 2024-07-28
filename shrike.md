# Shrike

My take on a game engine



## Usage

### Instantiate Engine
```javascript
const engine = new Shrike(canvas, game_speed, canvas_width,canvas_height)
 ```
the constructor manages initialization of required data

## Game Objects
hold geometric data of game objects (determined by render module)

#### Hitboxes
its the same as a game object, only reason it is used is so that it can be handled seperately(collision detection module)

## Transformations
transformations : translation, scale, rotation
these transformations can be linked together to have multiple axis control 
translations are attached to GameObjects and decide their positions in space

### General Construction of a Shrike Object
```javascript
const Layer | Object | Transformation = new ShrikeObject(type,subtype)
```




# TODO 
### currently implemented 
- Core 
- 2d canvas api based renderer
- Event manager
- Behavior manager
- 3x3 matrix library (incomplete)

### to be implemented
- Collision detection system
- some sort of lsp documentation?
- documentation abt params
- 2d webgl based renderer
- Physics Engine
- 3d webgl based renderer
- 4x4 matrix library


