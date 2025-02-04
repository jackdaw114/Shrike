import { glMatrix, mat4, quat, vec3 } from "gl-matrix";

export default class Camera {
    constructor() {
        this.matrix = mat4.create();
        this.position = [0, 0, 1];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.forward = vec3.create();
        this.right = vec3.create();
        this.calculateRight();
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
        let tempVec = vec3.create();

        vec3.add(
            this.target,
            this.right.map(
                (e) => e * vec3.dist(this.target, this.position) * amount
            ),
            this.target
        );
        vec3.add(
            tempVec,
            this.right.map(
                (e) => e * vec3.dist(this.target, this.position) * amount
            ),
            this.position
        );

        this.setPosition(tempVec);
    }
    panVertical(amount) {
        let tempVec = vec3.create();
        vec3.cross(tempVec, this.forward, this.right);
        vec3.add(
            this.target,
            this.up.map(
                (e) => e * vec3.dist(this.target, this.position) * amount
            ),
            this.target
        );
        vec3.add(
            tempVec,
            tempVec.map(
                (e) => e * vec3.dist(this.target, this.position) * amount
            ),
            this.position
        );

        this.setPosition(tempVec);
    }
    zoom(amount) {
        let tempVec = vec3.create();
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
        quat.fromEuler(quaternion, 0, -amount, 0);
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
}
