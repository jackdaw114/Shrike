# Shrike

My take on a game engine


## Design 
Shrike is designed to be completely modular

The core module (Shrike.js) is an interface for all other modules to be linked to 
the main game loop is handled by the core

## Usage

### Instantiate Engine
```javascript
const engine = new Shrike(canvas, game_speed, canvas_width,canvas_height)
 ```
the constructor manages initialization of required data

### Shrike Objects

everything within the engine is instantiated using ShrikeObject class (normalization purposes)

#### Layers
there are 3 types of layers base, geometry and behavior

the base layer is to be used later internally for optimization purposes

geometry and behavior layers just hold lists of Objects that are to be used for their respective modules

Note: almost every usecase can be changed because it is handled by its own module

on that note here is my idea of the layer structure


                        ┌──────────┐                
                        │base layer│                
                        └────┬─────┘                
                             │                      
             ┌───────────────┴──────────────┐       
             │                              │       
      ┌──────┴───────┐              ┌───────┴──────┐
      │geometry layer│              │behavior layer│
      └──────────────┘              └──────────────┘
             ▼                              ▼       
      ┌──────────────┐              ┌──────────────┐
      │geometry layer│              │behavior layer│
      └──────┬───────┘              └───────┬──────┘
             │                              │       
             └───────────────┬──────────────┘       
                             │                      
                             │                      
                             │                      
                             ▼                      
                        ┌──────────┐                
                        │base layer│                
                        └────┬─────┘                
                             │                      
             ┌───────────────┴──────────────┐       
             │                              │       
      ┌──────┴───────┐              ┌───────┴──────┐
      │geometry layer│              │behavior layer│
      └──────────────┘              └──────────────┘
             ▼                              ▼       
      ┌──────────────┐              ┌──────────────┐
      │geometry layer│              │behavior layer│
      └──────┬───────┘              └───────┬──────┘
             │                              │       
             └───────────────┬──────────────┘       
                             │                      
                             │                      
                             │                      
                             ▼                      
                        ┌──────────┐                
                        │base layer│                
                        └──────────┘                


#### Game Objects
hold geometric data of game objects (determined by render module)

#### Hitboxes
its the same as a game object, only reason it is used is so that it can be handled seperately(collision detection module)

#### Transformations
transformations : translation, scale, rotation
these transformations can be linked together to have multiple axis control 
translations are attached to GameObjects and decide their positions in space

### General Construction of a Shrike Object
```javascript
const Layer | Object | Transformation = new ShrikeObject(type,subtype)
```








### Modules currently implemented 
- Core 
- 2d canvas api based renderer
- Event manager
- Behavior manager
- 3x3 matrix library (incomplete)

### Modules to be implemented
- Collision detection system
- 2d webgl based renderer
- Physics Engine
- 3d webgl based renderer
- 4x4 matrix library


