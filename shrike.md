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

## Layers
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

## Some Concepts
To provide more granular control in module design, objects within the game engine are equipped with only essential functionality.

Eg. 
render/hitbox objects need to be linked to transformations so that their transformations are determined by all the modules
transformations can be linked to multiple geometry objects hence having control over their positions (transformations can also be linked to transforamations (providing axis control (idk what its called)))



## Working of Core module
has class definintions for ShrikeObject and Shrike

### Main funcitons:
#### Shrike:
- constructor (described above)
- shrikeRun() (to run the game loop)

#### ShrikeObject:
- constructor (described above)
- addLink(shrikeObject) (creates links for each object) 
- bindTransformation(shrikeObject) (links transformations to object) 
- attachParam(json) (shrikeObject type and subtype dependent)
    
## Working of Behavior module
the Behavior module is given the Top most base layer
a layer link is used to obtain a link to a behavior layer in the current base layer
all behavior layers are linked to each other in their respective base layers

the behavior layer holds a transformation object list 
transformation objects have hook functions available for users
- onFrame 

## Working of Render module
(im not happy with this so i wont explain)


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


