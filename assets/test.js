update = (deltaTime, components, scene,activeKeys) => {
    console.log("update", deltaTime, components, scene)
    const transform = components.Transformation[0]
    if (activeKeys.w !== undefined) {
        transform.translate(0,0,deltaTime/2000)
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