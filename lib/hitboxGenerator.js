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
        let body = new CANNON.Body({material: defaultMaterial});
        body.mass = json.mass;
        this.setTypeFromJSON(body,json.type);
        this.shapeFromJSON(body,json.shapes);
        return body;
    }

    updateBodyFromJSON(body,json){
        body.shapes.length = 0;
        body.shapeOffsets.length = 0;
        body.mass = json.mass;
        this.setTypeFromJSON(body,json.type);
        this.shapeFromJSON(body,json.shapes);
        body.updateBoundingRadius();
        body.updateMassProperties();
        body.computeAABB();
        return body;
    }

    setTypeFromJSON(body,type){
        switch(type){
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
    }

    shapeFromJSON(body,json){
        for (const shapeData of json) {
            switch(shapeData.shape){
                case 'box':
                    let size = new CANNON.Vec3(shapeData.size.x,shapeData.size.y,shapeData.size.z);
                    this.shape = new CANNON.Box(size);
                    break;
                case 'sphere':
                    this.shape = new CANNON.Sphere(shapeData.size.x);
                    break;
                case 'cylinder':
                    this.shape = new CANNON.Cylinder(shapeData.size.x,shapeData.size.y,shapeData.size.z,16);
                    break;
                default:
                    console.warn(`${shapeData.shape} is not a valid type`);
            }
            if(!shapeData.position){
                this.offset.set(0,0,0);
            }else{
                this.offset.copy(shapeData.position);
            }
            if(!shapeData.orientation){
                this.orientation.set(0,0,0,1);
            }else{
                this.orientation.copy(shapeData.orientation);
            }
            body.addShape(this.shape,this.offset,this.orientation);
        }
        return body;
    }
}
export default hitboxGenerator;