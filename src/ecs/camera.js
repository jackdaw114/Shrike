import { glMatrix, mat4, quat, vec3 } from "gl-matrix";

export default class Camera {
    constructor(
        type = "orthographic",
        customOptions = {  }
    ) {
        const defaultOptions = {
            fov: 55,
            aspect_ratio: 1,
            near: 0.1,
            far: 1000,
            left: -1,
            right: 1,
            top: 1,
            bottom: -1
        }
        const options = {...defaultOptions,...customOptions}
        this.aspect_ratio = options.aspect_ratio
        this.fov = options.fov 
        this.type = type;
        this.matrix = mat4.create();
        this.position = [0, 1, 0];
        this.target = [0, 0, 0];
        this.up = [0, 0, 1];
        this.forward = vec3.create();
        this.right = vec3.create();
        this.zoomVal = 1
        this.calculateRight();
        this.dirtyProj;
        this.dirtyMat;
        this.projectionMatrix = mat4.create();
        switch (type) {
            case "perspective":
                mat4.perspective(
                    this.projectionMatrix,
                    glMatrix.toRadian(options.fov),
                    options.aspect_ratio,
                    options.near,
                    options.far
                );
                break;
            case "orthographic":
                mat4.ortho(this.projectionMatrix,options.left, options.right, options.bottom, options.top, options.near, options.far)
                break;
            default:
                throw new Error("invalid camera Type")
        }
    }
    getProjMatrix() {
        return this.projectionMatrix;
    }
    calculateRight() {
        this.calculateForward();

        vec3.cross(this.right, this.up, this.forward);
        this.normalizeAll();
    }
    calculateForward() {
        vec3.sub(this.forward, this.target, this.position);
    }

    normalizeAll() {
        vec3.normalize(this.up, this.up);
        vec3.normalize(this.forward, this.forward);
        vec3.normalize(this.right, this.right);
    }

    setPosition(position) {
        this.position = position;
        this.calculateRight();

        //vec3.cross(this.right, a, b)
        this._calculateMatrix();
    }
    setTarget(target) {
        this.target = target;
        this._calculateMatrix();
    }
    _calculateMatrix() {
        mat4.lookAt(this.matrix, this.position, this.target, this.up);
    }

    panHorizontal(amount) {
        // Calculate the pan distance based on the current distance to target
        const panDistance = vec3.dist(this.position, this.target) * amount;
        
        // Create temporary vectors for position and target updates
        const positionOffset = vec3.create();
        const targetOffset = vec3.create();
        
        // Scale the right vector by the pan distance
        vec3.scale(positionOffset, this.right, panDistance);
        vec3.scale(targetOffset, this.right, panDistance);
        
        // Update position and target
        vec3.add(this.position, this.position, positionOffset);
        vec3.add(this.target, this.target, targetOffset);
        
        // Recalculate camera orientation
        this.calculateRight();
        this._calculateMatrix();
    }

    panVertical(amount) {
        // Calculate the pan distance based on the current distance to target
        const panDistance = vec3.dist(this.position, this.target) * -amount;
        
        // Create temporary vectors for position and target updates
        const positionOffset = vec3.create();
        const targetOffset = vec3.create();
        
        // Calculate the camera's local up vector (perpendicular to forward and right)
        const localUp = vec3.create();
        vec3.cross(localUp, this.right, this.forward);
        vec3.normalize(localUp, localUp);
        
        // Scale the local up vector by the pan distance
        vec3.scale(positionOffset, localUp, panDistance);
        vec3.scale(targetOffset, localUp, panDistance);
        
        // Update position and target
        vec3.add(this.position, this.position, positionOffset);
        vec3.add(this.target, this.target, targetOffset);
        
        // Recalculate camera orientation
        this.calculateRight();
        this._calculateMatrix();
    }

    zoom(amount) {
        let tempVec = vec3.create();
        this.zoomVal += amount
        //vec3.add(this.target,this.forward.map(e=>e*amount),this.target)
        vec3.add(
            tempVec,
            this.forward.map(
                (e) =>
                    ((e * vec3.dist(this.position, this.target)) / 5) * amount
            ),
            this.position
        );
        this.setPosition(tempVec);
    }
    orbitX(amount) {
        let quaternion = quat.create();
        quat.fromEuler(quaternion, 0, 0, -amount);
        let tempVec = vec3.create();
        vec3.transformQuat(tempVec, this.position, quaternion);
        this.setPosition(tempVec);
    }
    orbitY(amount) {
        if (vec3.dot(this.forward, this.up) > 0.99 && amount < 0) {
            return;
        }
        if (vec3.dot(this.forward, this.up) < -0.99 && amount > 0) {
            return;
        }
        let quaternion = quat.create();
        let tempVec = vec3.create();

        quat.setAxisAngle(quaternion, this.right, amount / 100);
        vec3.transformQuat(tempVec, this.position, quaternion);

        this.setPosition(tempVec);
    }
    distFromTarget() {
        return vec3.dist(this.position, this.target);
    }
    dist(vec) {
        return vec3.dist(this.position, vec)
    }

    unproject(screenX, screenY, viewportWidth, viewportHeight, depth = 0) { 
        //TODO: Better way to do this (project ray from camera to a plane instead of point on gizmo)
        let z = -depth ;
        let x = (screenX *2 / (viewportWidth))-1.0;
        let y = (1.0-(screenY *2/ (viewportHeight)))/2;
        x*=-z 
        y*=-z
        let unprojectedVec3 = vec3.create()
        const viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, this.matrix, this.projectionMatrix);
        const invViewProjMatrix = mat4.create();
        mat4.invert(invViewProjMatrix, viewProjMatrix);
        const invProjMatrix = mat4.create();
        mat4.invert(invProjMatrix, this.projectionMatrix);
        const invViewMatrix = mat4.create();
        mat4.invert(invViewMatrix, this.matrix);


        vec3.transformMat4(unprojectedVec3, new Float32Array([x, y, z]), this.projectionMatrix)

        let testVec = vec3.create() 
        const worldPos = vec3.create();
        vec3.transformMat4(worldPos, new Float32Array([x, y, z]), invViewMatrix);
        return worldPos;
    }
}
