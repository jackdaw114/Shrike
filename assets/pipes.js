update = (deltaTime,CANNON, components, scene,activeKeys) => {
    const physicsBody = components.PhysicsBody[0];
    physicsBody.body.velocity.set(1,0,0);
    if (components.Transformation[0].position.x > 2){
        physicsBody.body.position.x = -7;
    }
}