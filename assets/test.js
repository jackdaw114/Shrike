update = (deltaTime,CANNON, components, scene,activeKeys) => {
    console.log("update", deltaTime, components, scene)
    console.log("this",this)
    const transform = components.Transformation[0]
    if(activeKeys.b !== undefined){
        components.PhysicsBody[0].body.applyLocalImpulse({x:0,y:0,z:.2},{x:0,y:0,z:0})
    }
    if (activeKeys.w !== undefined) {
        components.PhysicsBody[0].body.position.vadd({x:0,y:deltaTime/2000,z:0},components.PhysicsBody[0].body.position)
    }
    if (activeKeys.s !== undefined) {
        transform.translate(0,0,-deltaTime/2000)
    }
    if (activeKeys.a !== undefined) {
        transform.translate(-deltaTime/2000,0,0)
    }
    if (activeKeys.d !== undefined) {
        transform.translate(deltaTime/2000,0,0)
    }
    if (activeKeys.space !== undefined) {
        transform.translate(0,deltaTime/2000,0)
    }
    if (activeKeys.shift !== undefined) {
        transform.translate(0,-deltaTime/2000,0)
    }
}