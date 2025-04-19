update = (deltaTime, CANNON, components, scene, activeKeys) => {
    const physicsBody = components.PhysicsBody[0].body;
    const transform = components.Transformation[0];
    
    // Forward/Backward (W/S)
    if (activeKeys.w !== undefined) {
        physicsBody.applyLocalImpulse({x:0, y:0, z:deltaTime/50}, {x:0, y:0, z:0});
    }
    if (activeKeys.s !== undefined) {
        physicsBody.applyLocalImpulse({x:0, y:0, z:-deltaTime/100}, {x:0, y:0, z:0});
    }
    
    // Left/Right (A/D)
    if (activeKeys.a !== undefined) {
        physicsBody.applyLocalImpulse({x:-deltaTime/100, y:0, z:0}, {x:0, y:0, z:0});
    }
    if (activeKeys.d !== undefined) {
        physicsBody.applyLocalImpulse({x:deltaTime/100, y:0, z:0}, {x:0, y:0, z:0});
    }
    
    // Up/Down (Shift/Ctrl)
    if (activeKeys.t !== undefined) {
        physicsBody.applyLocalImpulse({x:0, y:deltaTime/100, z:0}, {x:0, y:0, z:0});
    }
    if (activeKeys.y !== undefined) {
        physicsBody.applyLocalImpulse({x:0, y:-deltaTime/100, z:0}, {x:0, y:0, z:0});
    }
}
