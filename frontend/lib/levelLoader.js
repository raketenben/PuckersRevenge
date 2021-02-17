import HitboxGenerator from './hitboxGenerator.js';
import assetManager from "./assetManager.js";

class levelLoader {
    hitboxGenerator;
    textureLoader;
    gltfLoader;
    assetManager;

    scene;
    renderer;
    physicsWorld;

    constructor(){

        this.hitboxGenerator = new HitboxGenerator();
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new THREE.GLTFLoader();
        this.assetManager = new assetManager();

    }

    init(_scene,_renderer,_physicsWorld){
        this.scene = _scene;
        this.renderer = _renderer;
        this.physicsWorld = _physicsWorld;

        return new Promise((res,rej) => {
            this.assetManager.init().then(res,rej);
        })
    }

    addObjectToScene(object,res,prog,rej){
        this.assetManager.retrieveObject(object.name,(asset) => {
            this.gltfLoader.load(asset.object, (gltf) => {
                this.textureLoader.load(asset.env,(texture) => {
                    fetch(asset.hitbox)
                    .then(response => response.json())
                    .then(hitbox => {
                        //apply env map
                        var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024).fromEquirectangularTexture( this.renderer, texture );
                        gltf.scene.traverse((node) => {
                            if (node.isMesh) node.material.envMap = cubeRenderTarget.texture;
                        });
                        //get preview camera
                        //var camera1 =  gltf.cameras[0];
    
                        //add hitbox
                        let body = this.hitboxGenerator.bodyFromJSON(hitbox);
                        this.physicsWorld.addBody(body);
    
                        //add object to scene
                        this.scene.add( gltf.scene)
    
                        res();
                    }).catch(rej);
                },null,rej)
            },rej);
        },prog,rej);
    }

    load(levelname,res,prog,rej){
        this.loadLevelFile(levelname,(levelFile) => {
            let total = 0;
            let loaded = 0;
            for (const object of levelFile.objects) {
                total++;
                this.addObjectToScene(object,() => {
                    loaded++;
                    if(loaded == total) return res();
                },prog,rej)
            }
        },rej);
    }

    loadLevelFile(levelName,res,rej){
        fetch(`http://127.0.0.1:1337/levels/${levelName}.json`)
        .then(response => response.json())
        .then(res,rej);
    }
}
export default levelLoader;