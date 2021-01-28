import * as THREE from './node_modules/three/build/three.module.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';

const enterVrButton = document.getElementById("enterVR");

const playerHeight = new THREE.Vector3(0,1.8,0);
const playerSpeed = 1.5;
const highlightMaterial = new THREE.MeshBasicMaterial( { color: 0xffc100 } );

let stats, clock;
let camera, scene, renderer;
let xrSession, xrReferenceSpace;
let user, pivot, marker, marker1;
let physicsWorld, playerBox, ground;
let holding = {left:null,right:null};

let iao = new Array();

init();
async function init() {

    //initialize
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    stats = new Stats();
    clock = new THREE.Clock();
    user = new THREE.Group();

    //physics
    physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0,-9.82,0);

    //initialize modules
    const loader = new GLTFLoader();
    const controllerModelFactory = new XRControllerModelFactory();

    //scene settings
    scene.background = new THREE.Color("#465461");

    //add additional light to scene
    const hemiLight = new THREE.HemisphereLight(0xFFF9CC, 0xFFF9CC, 0.6);
    scene.add(hemiLight);

    //add camera
    user.add(camera);
    scene.add(user);

    //ground
    let shape = new CANNON.Box(new CANNON.Vec3(10,0.1,10));
    ground = new CANNON.Body({ mass: 0 });
    ground.addShape(shape,new CANNON.Vec3(0,-0.1,0));
    physicsWorld.addBody(ground);
    //testbox
    let shape2 = new CANNON.Box(new CANNON.Vec3(0.5,2,0.5));
    let testbox = new CANNON.Body({ mass: 0 });
    testbox.addShape(shape2,new CANNON.Vec3(0,1,0));
    physicsWorld.addBody(testbox);

    //add hitbox
    let shape1 = new CANNON.Box(new CANNON.Vec3(0.2,1.8,0.2));
    playerBox = new CANNON.Body({ mass: 65 });
    playerBox.angularDamping=1;
    playerBox.position.x = 5;
    playerBox.position.y = 5;
    playerBox.addShape(shape1,new CANNON.Vec3(0,1.8,0));
    physicsWorld.addBody(playerBox);

    //pivot
    const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    pivot = new THREE.Mesh( geometry, material );
    scene.add(pivot);

    marker = new THREE.Mesh( geometry, material );
    scene.add(marker);
    marker1 = new THREE.Mesh( geometry, material );
    scene.add(marker1);

    //renderer settings
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local-floor' );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(window.innerWidth, window.innerHeight);

    //show canvas
    document.body.appendChild(renderer.domElement);

    //show stats
    document.body.appendChild(stats.domElement);

    if(navigator.xr){
        navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {
            if(!supported){
                enterVrButton.innerHTML = "VR not supported";
                enterVrButton.classList.add("disabled");
            }
        });
    }else{
        enterVrButton.innerHTML = "VR not supported";
    }

    //xr session events   
    enterVrButton.addEventListener("click",function(){
        const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ] };
        if(!xrSession){
            navigator.xr.requestSession( 'immersive-vr', sessionInit ).then((ses) => {
                renderer.xr.setSession(ses);
            });
        }else{
            enterVrButton.innerHTML = "Enter VR";
            xrSession.end();
        }
    });

    renderer.xr.addEventListener('sessionstart', function (event) {
        let session = event.target.getSession();
        console.log("ses",session);

        console.log(renderer.xr);

        xrSession = session;

        xrReferenceSpace = renderer.xr.getReferenceSpace();

        enterVrButton.innerHTML = "Leave VR";

        //add controllers to scene
        const controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1)
        );
        user.add(controllerGrip1);

        const controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
            controllerModelFactory.createControllerModel(controllerGrip2)
        );
        user.add(controllerGrip2);

        console.log(xrSession);

        xrSession.addEventListener("selectstart",handleSelect);
        xrSession.addEventListener("selectend",handleSelectEnd);

        xrSession.requestAnimationFrame(drawFrame);
    });
    renderer.xr.addEventListener('sessionend', function (event) {
        xrSession = null;
        enterVrButton.innerHTML = "Enter VR";
    });

    //load scene
    loader.load('./public/elevator-chamber.glb', (gltf) => {
        var model = gltf.scene;
        scene.add(model);
        console.log(gltf);
        renderer.render(scene, camera);

        iao = scene.getObjectByUserDataProperty("interactable",1);

        /*
        for(var obj of iao){
            physicsWorld.add obj
        }*/

        console.log(iao);
        /*
        mixer = new THREE.AnimationMixer( model);

        // Play a specific animation
        const clips = findClipsByName(gltf.animations,['open1','open2','open3','open4'])
        console.log(clips);
        for (const i in clips) {
            const action = mixer.clipAction(clips[i]);
            action. clampWhenFinished = true;
            action.setLoop(THREE.LoopOnce);
            action.play();
        }*/

        /*scene.traverse((node) => {
            if (node.isMesh) node.material.envMap = texture;
            if(node.isMesh) console.log(node);
        });*/

        scene.traverse((node) => {
            if (node.isMesh) selected.push(node);
        });
        
        outline.selectedObjects = selected;

    }, function (xhr) {
    }, function () {
    });

    console.log(renderer)
    //render loop
    //renderer.setAnimationLoop(gameLoop);
}

function findClipsByName(animations,names) {
    var ret = new Array();
    for (const i in names) {
        var clip = THREE.AnimationClip.findByName( animations, names[i] );
        if(clip) ret.push(clip);
    }
    return ret;
}

function drawFrame(frameTime,frame){
    stats.begin();

    const delta = clock.getDelta();
    const pose = frame.getViewerPose(xrReferenceSpace);

    var nextFrameId = xrSession.requestAnimationFrame(drawFrame);

    physicsWorld.step(delta);

    if(pose){
        if(xrSession) handleInputs(frame,delta,pose);
        
        renderer.render(scene, camera);
    }

    stats.end();
}

function transformToGlobalLocation(space){
    const orientation = new THREE.Quaternion().copy(space.transform.orientation);
    const rotatedRealPosition = (new THREE.Vector3().copy(space.transform.position)).applyQuaternion(user.quaternion);
    const currentPosition = new THREE.Vector3().copy(user.position).add(rotatedRealPosition);

    return {orientation:orientation,currentPosition:currentPosition};
}

function moveVirtualPlayerToMatch(space, position){
    const rotatedLocalPosition = (new THREE.Vector3().copy(space.transform.position)).applyQuaternion(user.quaternion);
    const virtualPlayerPosition = new THREE.Vector3().copy(position).add(rotatedLocalPosition.negate());

    user.position.copy(virtualPlayerPosition.add(playerHeight.negate()));
} 

function handleSelect(eve){
    const targetRay = eve.frame.getPose(eve.inputSource.targetRaySpace,xrReferenceSpace);
    const targetRaySpace = transformToGlobalLocation(targetRay);
    for (const interactableObject of iao) {
                    
        let distance = interactableObject.position.distanceTo(targetRaySpace.currentPosition);
        //marker.position.copy(targetRaySpace.currentPosition);
        let realPos = new THREE.Vector3();
        interactableObject.getWorldPosition(realPos);
        //marker1.position.copy(realPos);
        
        console.log("eve",eve);
        if(distance < 0.2) {
            holding[eve.inputSource.handedness] = interactableObject;
        }
    } 
}
function handleSelectEnd(eve){
    const targetRay = eve.frame.getPose(eve.inputSource.targetRaySpace,xrReferenceSpace);
    const targetRaySpace = transformToGlobalLocation(targetRay);
    for (const interactableObject of iao) {
                    
        let distance = interactableObject.position.distanceTo(targetRaySpace.currentPosition);
        let realPos = new THREE.Vector3();
        interactableObject.getWorldPosition(realPos);
        
        if(distance < 0.2) {
            if(holding[eve.inputSource.handedness]) holding[eve.inputSource.handedness] = null;
        }
    } 
}

let deltaPosition = new THREE.Vector3();

var timeout;
var allowRotation = true;
const rotationTimeout = 500;
function handleInputs(frame,delta,pose){
    
    //match current Playerposition to physical Position
    moveVirtualPlayerToMatch(pose,playerBox.position);

    //player Position in game
    let playerHeadSpace = transformToGlobalLocation(pose);
    playerHeadSpace.currentPosition.add(playerHeight);

    playerHeight.setY(pose.transform.position.y);
    playerHeight.negate();
    deltaPosition.add(new THREE.Vector3().copy(pose.transform.position).negate());
    console.log("offset -->",deltaPosition);
    user.position.add((new THREE.Vector3().copy(deltaPosition.negate())).applyQuaternion(user.quaternion));
    deltaPosition.copy(pose.transform.position);

    pivot.position.copy(playerHeadSpace.currentPosition);
    pivot.position.setY(0.5);

    
    for (const interactableObject of iao) {
        if(interactableObject.materialKeep && !interactableObject.keepInteract) interactableObject.material = interactableObject.materialKeep;
    }

    for (const source of xrSession.inputSources) {
        if(source.targetRaySpace){
            const targetRay = frame.getPose(source.targetRaySpace,xrReferenceSpace);
            
            //console.log(targetRay.transform.position);
            if(targetRay){
                const targetRaySpace = transformToGlobalLocation(targetRay);

                //show item
                if(holding[source.handedness]) {
                    holding[source.handedness].position.copy(targetRaySpace.currentPosition);
                    holding[source.handedness].quaternion.copy(targetRaySpace.orientation);
                }


                for (const interactableObject of iao) {
                    
                    let distance = interactableObject.position.distanceTo(targetRaySpace.currentPosition);
                    //marker.position.copy(targetRaySpace.currentPosition);
                    let realPos = new THREE.Vector3();
                    interactableObject.getWorldPosition(realPos);
                    //marker1.position.copy(realPos);
                    
                    if(distance < 0.2 && !interactableObject.keepInteract) {
                        interactableObject.materialKeep = interactableObject.material;
                        interactableObject.material = highlightMaterial;
                    }
                } 
            }
        }

        const axes = source.gamepad.axes;
        if(source.handedness === "left"){
            if(axes[2] && axes[3]){
                //gamepad input
                var offsetPos = new THREE.Vector3(source.gamepad.axes[2],0,source.gamepad.axes[3]);

                //apply passed time and playerSpeed
                offsetPos.multiplyScalar(delta);
                offsetPos.multiplyScalar(playerSpeed);
                
                //apply head rotation and camera parent rotation
                offsetPos.applyQuaternion(playerHeadSpace.orientation);
                offsetPos.applyQuaternion(user.quaternion);
                
                //cancel all verticall movement
                offsetPos.setY(0);

                //apply movement
                user.position.add(offsetPos);
                //playerBox.applyForce(new CANNON.Vec3().copy(offsetPos),new CANNON.Vec3().copy(playerHeadSpace.currentPosition));
            }
        }else if(source.handedness === "right"){
            if(axes[2] && axes[3]){
                if(allowRotation){
                    if(axes[2] > 0.5){
                        allowRotation = false;
                        user.rotateAroundWorldAxis(playerHeadSpace.currentPosition,new THREE.Vector3(0,1,0),-0.78539816339);
                        timeout = setTimeout(function(){allowRotation = true;},rotationTimeout);
                    }else if(axes[2] < -0.5){
                        allowRotation = false;
                        user.rotateAroundWorldAxis(playerHeadSpace.currentPosition,new THREE.Vector3(0,1,0),0.78539816339);
                        timeout = setTimeout(function(){allowRotation = true;},rotationTimeout);
                    }else if(axes[2] < 0.5 && axes[2] > -0.5){
                        allowRotation = true;
                        clearInterval(timeout);
                    }
                }
            }
        }
    }
    //get changed Player position in game
    playerHeadSpace = transformToGlobalLocation(pose);
    playerHeadSpace.currentPosition.add(playerHeight);

    //apply player Position to physics Dummy
    playerBox.position.copy(playerHeadSpace.currentPosition);
}

THREE.Object3D.prototype.getObjectByUserDataProperty = function ( name, value ) {
    var list = new Array();

	if ( this.userData[ name ] === value ) return this;
	for ( var i = 0, l = this.children.length; i < l; i ++ ) {

		var child = this.children[ i ];
		var object = child.getObjectByUserDataProperty( name, value );

		if ( object !== undefined ) {
            if(Array.isArray(object)){
                list = list.concat(object);
            }else{
                list.push(object);
            }
		}
    }
    return list;
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

    // rotate object around axis in world space (the axis passes through point)
    // axis is assumed to be normalized
    // assumes object does not have a rotated parent

    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis( point, axis, angle ) {
        q.setFromAxisAngle( axis, angle );

        this.applyQuaternion( q );

        this.position.sub( point );
        this.position.applyQuaternion( q );
        this.position.add( point );

        return this;
    }
}();