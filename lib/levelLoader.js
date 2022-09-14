//const apiEndpoint = "https://puckersrevenge.if-loop.mywire.org";
const apiEndpoint = "PuckersRevenge/";

import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

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

    currentEntryPosition;
    currentExitPosition;

    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        this.assetManager = new assetManager();
    }

    init(_scene, _renderer, _physicsWorld, _defualtMaterial) {
        this.hitboxGenerator = new HitboxGenerator(_defualtMaterial);

        this.scene = _scene;
        this.renderer = _renderer;
        this.physicsWorld = _physicsWorld;

        return new Promise((res, rej) => {
            this.assetManager.init().then(res, rej);
        })
    }

    addObjectToScene(object, offset, res, prog, rej) {
        this.assetManager.retrieveObject(object.name, (asset) => {
            this.gltfLoader.load(asset.object, (gltf) => {
                this.textureLoader.load(asset.env, (texture) => {
                    //apply env map
                    var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024).fromEquirectangularTexture(this.renderer, texture);
                    gltf.scene.traverse((node) => {
                        if (node.isMesh) node.material.envMap = cubeRenderTarget.texture;
                    });

                    //add hitbox
                    let body = this.hitboxGenerator.bodyFromJSON(asset.hitBoxes[0]);
                    body.position.set(object.position.x + offset.x, object.position.y + offset.y, object.position.z + offset.z)
                    body.quaternion = new CANNON.Quaternion().copy(object.rotation);
                    this.physicsWorld.addBody(body);

                    gltf.scene.position.copy(object.position)
                    gltf.scene.position.add(offset)

                    gltf.scene.quaternion.copy(object.rotation);

                    //add object to scene
                    gltf.scene.name = asset.name;
                    gltf.scene.userData.imposter = body;
                    gltf.scene.userData.hitboxes = asset.hitBoxes;


                    let _attributes = object.attributes;
                    if (_attributes) {
                        if (!gltf.scene.userData) gltf.scene.userData = new Array();
                        if (!gltf.scene.userData.attributes) gltf.scene.userData.attributes = {};
                        for (let _attribute of _attributes) {
                            gltf.scene.userData.attributes[_attribute.name] = _attribute.value;
                        }
                    }
                    this.scene.add(gltf.scene);

                    res();
                }, null, rej)
            }, rej);
        }, prog, rej);
    }

    load(levelname, offset, res, prog, rej) {
        this.loadLevelFile(levelname, (levelFile) => {
            let total = levelFile.objects.length;
            let loaded = 0;

            function sendProgressUpdate(xhr) {
                xhr.objectTotal = total;
                xhr.objectLoaded = loaded;
                prog(xhr)
            }

            let nextLoad = () => {
                this.addObjectToScene(levelFile.objects[loaded], offset, () => {
                    loaded++;
                    if (loaded == total) {
                        sendProgressUpdate({ total: 1, loaded: 1, tag: "finished" })
                        return res(levelFile);
                    } else
                        nextLoad()
                }, (xhr) => {
                    sendProgressUpdate(xhr)
                }, rej);
            }
            nextLoad();
        }, rej);
    }

    loadLevelFile(levelName, res, rej) {
        fetch(`${apiEndpoint}/api/level/${levelName}`)
            .then(response => response.json())
            .then(res, rej);
    }
}
export default levelLoader;