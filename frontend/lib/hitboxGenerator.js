const defaultMaterial = new CANNON.Material({ name: "default" });

class hitboxGenerator {
    constructor(){
        return this;
    }

    shape;
    size = new CANNON.Vec3();
    offset = new CANNON.Vec3();
    orientation = new CANNON.Quaternion();

    bodyFromJSON(json){
        let body = new CANNON.Body({ mass: json.mass, material: defaultMaterial});
        switch(json.type){
            case "static":
                body.type = CANNON.Body.STATIC;
                break;
            case "kinematic":
                body.type = CANNON.Body.KINEMATIC;
                break;
            case "dynamic":
                body.type = CANNON.Body.DYNAMIC;
                break;
            default:
                body.type = CANNON.Body.STATIC;
                console.warn(`${json.type} is not a valid type`);
        }
        this.shapeFromJSON(body,json.shapes);
        return body;
    }

    shapeFromJSON(obj,json){
        for (const shapeData of json) {
            switch(shapeData.shape){
                case 'box':
                    let size = new CANNON.Vec3(shapeData.size.x,shapeData.size.y,shapeData.size.z);
                    this.shape = new CANNON.Box(size);
                    break;
                case 'sphere':
                    this.shape = new CANNON.Sphere(shapeData.size);
                    break;
                case 'cylinder':
                    this.shape = new CANNON.Cylinder(shapeData.size.topRadius,shapeData.size.bottomRadius,shapeData.offset.height,shapeData.offset.segments);
                    break;
                default:
                    console.warn(`${shapeData.shape} is not a valid type`);
            }
            if(!shapeData.position){
                this.offset.set(0,0,0);
            }else{
                this.offset.set(shapeData.position.x,shapeData.position.y,shapeData.position.z);
            }
            if(!shapeData.orientation){
                this.orientation.set(0,0,0,1);
            }else{
                this.orientation.set(shapeData.orientation.x,shapeData.orientation.y,shapeData.orientation.z,shapeData.orientation.w);
            }
            obj.addShape(this.shape,this.offset,this.orientation);
        }
        return obj;
    }
}
export default hitboxGenerator;