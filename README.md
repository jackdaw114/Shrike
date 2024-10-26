# Shrike Documentation

version: 0.0.1-pre-alpha

## Overview

Shrike is a lightweight game engine. It provides developers with essential tools and systems for creating 3D games using javascript.

## Getting Started

### Installation

developer installation

```bash
# clone repository
git clone https://github.com/jackdaw114/Shrike.git

# select repository
git checkout alpha

# (pre-alpha only)
npm run dev
```

## Basic Functionality

### create game engine object

```javascript
import Shrike from "./src/core/core.js";

// get canvas element

const shrikeInstance = new Shrike(canvas, width, height);
```

---

### creating a scene

```javascript
const scene = shrikeInstance.creatScene();
```

---

### creating entities

entities are empty containers for components
entities require a scene to be attached to

```javascript
const entity = shrikeInstance.createEntity(scene);
```

### creating and attaching systems

systems can be imported form their respective dirs
each system has it own requirement (documentation pending)
systems are like plugins you can create your own components (documentation pending)

```javascript
import { SystemConstructor } from "check/documentation/for/desired/system";

const system = shrikeInstance.createSystem(
    SystemConstructor,
    constructorParams
);
// attach system to a scene

scene.attachSystem(system);
```

### adding required components to entites

components are required by systems
systmes are registered to scenes and are attached to entities within a scene

```javascript
scene.addComponent(entity);
```

### initializing and starting game instance

```javascript
shrikeInstance.init();
shrikeInstance.start();
```
