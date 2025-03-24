export class CannonObject extends Component {
    constructor(mass,shape,position,materialOptions) {
        super();
        this.mass = mass;
        this.shape = shape;
        this.position = position;
        this.material =new CANNON.Material(materialOptions);
        this.body = new CANNON.Body({
            mass: this.mass,
            shape: this.shape,
            position: this.position,
            material: this.material
        });
    }
}

