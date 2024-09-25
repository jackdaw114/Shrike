export class Octree {
    constructor(center,size) {
        this.center = center
        this.size = size
        this.children = new Array(8)
        this.objects = []
    }
}
