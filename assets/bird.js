init = (CANNON,components,scene) =>{
    components.PhysicsBody[0].addEventListener("collide",()=>{
        console.log("end game")
        scene.endGame("collision")
    })
    
}

update = (deltaTime,CANNON, components, scene,activeKeys) => {
    const physicsBody = components.PhysicsBody[0].body
    const impulse = {x:0, y:0, z:0.2};
    const contactPoint = physicsBody.position.clone(); 

    if (activeKeys.w !== undefined){
        physicsBody.applyImpulse(impulse, contactPoint);
    }
}