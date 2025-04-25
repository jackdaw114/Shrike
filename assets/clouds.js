update = (deltaTime,CANNON, components, scene,activeKeys) => {
    const transformation = components.Transformation[0];
    const vel = 2;
    transformation.translate(deltaTime/1000*vel,0,0);
    if (transformation.position.x > 5){
        transformation.translate(-15,0,0)
    }
}