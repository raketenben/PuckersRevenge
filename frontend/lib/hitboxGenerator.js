class hitboxGenerator {
    constructor(){
        return this;
    }

    shape;
    size = new CANNON.Vec3();
    offset = new CANNON.Vec3();
    orientation = new CANNON.Quaternion();

    createFromJSON(obj,json){
        if(typeof json === 'string' || json instanceof String) json = JSON.parse(json);
        for (const shapeData of json) {
            let size = new CANNON.Vec3(shapeData.size.x,shapeData.size.y,shapeData.size.z);
            switch(shapeData.type){
                case 'box':
                    this.shape = new CANNON.Box(size);
                    break;
                case 'sphere':
                    this.shape = new CANNON.Sphere(shapeData.size);
                    break;
                case 'cylinder':
                    this.shape = new CANNON.Cylinder(shapeData.size.topRadius,shapeData.size.bottomRadius,shapeData.offset.height,shapeData.offset.segments);
                    break;
                default:
                    console.warn(`${shapeData.type} is not a valid type`);
            }
            if(shapeData.offset){
                this.offset.set(shapeData.offset.x,shapeData.offset.y,shapeData.offset.z);
            }else{
                this.offset.set(0,0,0);
            }
            if(shapeData.orientation){
                this.orientation.set(shapeData.orientation.x,shapeData.orientation.y,shapeData.orientation.z,shapeData.orientation.w);
            }else{
                this.orientation.set(0,0,0,1);
            }
            obj.addShape(this.shape,this.offset,this.orientation);
        }
        return obj;
    }
}
export default hitboxGenerator;