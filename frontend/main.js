import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import HitboxGenerator from './lib/hitboxGenerator.js';
import Hitboxes from "./hitboxes.js"

const enterVrButton = document.getElementById("enterVR");
const progressDisplay = document.getElementById("progress");

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

//physics materials
const defaultMaterial = new CANNON.Material({ name: "default" });
const playerMaterial = new CANNON.Material({ name: "player" });
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial,playerMaterial,{
    friction: 0.01,
    restitution: 0.0,
});

//player settings
const playerSpeed = 1.2;
const playerRotationTimeout = 350;
const playerRotationAngle = (Math.PI/180) * 30;

//interaction settings
const highlightMaterial = new THREE.MeshBasicMaterial( { color: 0xffc100 } );

//LEVEL loading (travel)
const elevatorTravelDistance = 100;
const elevatorIntialVelocity = 0.05;
const elevatorAcceleration = 1.01;
const elevatorTravelSpeed = 5;
const elevatorParticleSquare = 10;
const elevatorParticleHeight = 500;
const elevatorParticlesCount = 40000;
const elevatorParticleMaterial = new THREE.PointsMaterial({ color: 0x333333,size: 0.005});

const hitboxGenerator = new HitboxGenerator();
const controllerModelFactory = new XRControllerModelFactory();

let playerHeight = new THREE.Vector3(0,0,0);

let stats, clock;
let camera, camera1, scene, renderer;
let xrSession, xrReferenceSpace;
let user, pivot;
let physicsWorld, playerBox, testChamber;
let holding = {left:null,right:null};

let cannonDebug;

let mixer;

let iao = new Array();
let elevators = new Array();

let particleSystems = new Array();
let physicsObjects = new Array();

init();
function init() {
    //scene settings
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000,0.1);
    scene.background = new THREE.Color("#000000");

    //add additional light to scene
    const hemiLight = new THREE.HemisphereLight(0xFFF9CC, 0x000000, 1);
    scene.add(hemiLight);

    //add user to scene
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
    user = new THREE.Group();
    user.add(camera);
    scene.add(user);

    //setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: false});
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local-floor' );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    //physics
    physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0,-9.82,0);
    physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    physicsWorld.addContactMaterial(defaultContactMaterial);
    //physicsWorld.solver.iterations = 20;
    //physicsWorld.solver.tolerance = 0;

    //ground
    let ground = new CANNON.Body({ mass: 0 , material: defaultMaterial });
    hitboxGenerator.createFromJSON(ground,Hitboxes.ground);
    ground.type = CANNON.Body.STATIC;
    physicsWorld.addBody(ground);

    //elevator
    testChamber = new CANNON.Body({ mass: 0 , material: defaultMaterial });
    hitboxGenerator.createFromJSON(testChamber,Hitboxes.elevator);
    testChamber.type = CANNON.Body.KINEMATIC;
    physicsWorld.addBody(testChamber);

    //add hitbox
    let shape1 = new CANNON.Sphere(0.15);
    //let shape1 = new CANNON.Box(new CANNON.Vec3(0.1,0.9,0.1));
    playerBox = new CANNON.Body({ mass: 65 , material: playerMaterial});
    playerBox.angularDamping = 1;
    playerBox.type = CANNON.Body.DYNAMIC;
    playerBox.position.y = 0.02;
    playerBox.position.x = 0;

    //playerBox.addShape(shape1,new CANNON.Vec3(0,0.9,0));
    playerBox.addShape(shape1,new CANNON.Vec3(0,0.15,0));
    physicsWorld.addBody(playerBox);

    //utilities
    stats = new Stats();
    clock = new THREE.Clock();
    cannonDebug = new THREE.CannonDebugRenderer( scene, physicsWorld );

    //initialize modules
    const loader = new THREE.GLTFLoader();

    //pivot
    const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    pivot = new THREE.Mesh( geometry, material );
    scene.add(pivot);


    //show canvas
    document.body.appendChild(renderer.domElement);

    //show stats
    document.body.appendChild(stats.domElement);

    renderer.xr.addEventListener('sessionstart', sessionStarted);

    renderer.xr.addEventListener('sessionend', function (event) {
        xrSession = null;
        enterVrButton.innerHTML = "Enter VR";
        renderer.setAnimationLoop(null);
    });

    //load scene
    loader.load('./public/elevator-chamber.glb', (gltf) => {
        var model = gltf.scene;
        scene.add(model);
        console.log(gltf);
        camera1 = gltf.cameras[0];
        renderer.render(scene, camera1);

        iao = scene.getObjectByUserDataProperty("interactable",1);
        elevators = scene.getObjectByUserDataProperty("elevator",1);
        
        mixer = new THREE.AnimationMixer( model);
 
        const clips = findClipsByName(gltf.animations,['open1','open2','open3','open4']);
        for (const i in clips) {
            let action = mixer.clipAction(clips[i]);
            
            console.log(clips[i]);
            action.clampWhenFinished = true;
            action.setLoop(THREE.LoopOnce);
            action.play();
        }

        setTimeout(function(){
            startElevatorTravel(elevators[0]);
        },15000);

    }, function (xhr) {
        let progress = Math.round((xhr.loaded / xhr.total) * 1000) / 10;
        progressDisplay.innerHTML = progress+" %";
    }, function () {
    });
}

function sessionStarted(event){
    xrSession = event.target.getSession();
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

    xrSession.addEventListener("selectstart",handleSelect);
    xrSession.addEventListener("selectend",handleSelectEnd);

    //xrSession.requestAnimationFrame(firstFrameDraw);
    renderer.setAnimationLoop(drawFrame);
}

function findClipsByName(animations,names) {
    var ret = new Array();
    for (const i in names) {
        var clip = THREE.AnimationClip.findByName( animations, names[i] );
        if(clip) ret.push(clip);
    }
    return ret;
}

function firstFrameDraw(frameTime,frame){
    xrSession.requestAnimationFrame(drawFrame);
    const pose = frame.getViewerPose(xrReferenceSpace);
    if(firstFrame){
        //init delta
        deltaPosition.copy(pose.transform.position);
        firstFrame = false;
    }
}

let firstFrame = true;
let delta = 0;
let pose = null;
function drawFrame(frameTime,frame){
    //xrSession.requestAnimationFrame(drawFrame);

    stats.begin();

    //show pivot
    //pivot.position.copy(playerBox.position);
    //pivot.position.setY(playerBox.position.y + 0.5);
    
    delta = clock.getDelta();
    pose = frame.getViewerPose(xrReferenceSpace);

	mixer.update( delta);

    handleElevators(frame,delta,pose);
    
    handleInputs(frame,delta,pose);
    handleInteractions(frame,delta,pose);

    updateAndMatchPhysics(delta,pose);

    // cannonDebug.update();

    renderer.render(scene, camera);

    stats.end();
}

function handleElevators(frame,delta,pose){

    for (let c = 0; c < particleSystems.length; c++) {
        for(var x = 0; x < particleSystems[c].geometry.vertices.length; x++){
            if (particleSystems[c].geometry.vertices[x].y > (elevatorParticleHeight*0.5)) {
                particleSystems[c].geometry.vertices[x].y = -(elevatorParticleHeight*0.5);
            }
            //particleSystems[c].geometry.vertices[x].y += elevatorTravelSpeed * delta;
        }
        particleSystems[c].geometry.verticesNeedUpdate = true;
    }

    //elevator
    for (let c = 0; c < elevators.length; c++) {
        if(elevators[c].userData.traveling){
            if(elevators[c].userData.acceleration < elevatorTravelSpeed) elevators[c].userData.acceleration *= elevatorAcceleration;
            elevators[c].userData.traveledDistance += elevators[c].userData.acceleration * delta;
            testChamber.velocity.y = -elevators[c].userData.acceleration;
            console.log(elevators[c].userData.acceleration,elevators[c].userData.traveledDistance);
            if(elevators[c].userData.traveledDistance > elevatorTravelDistance){
                elevators[c].userData.traveling = false;
            } 
            elevators[c].position.copy(testChamber.position);
        }else{
            testChamber.velocity.y = 0;
        }
    }
}

//TODO:REWRITE
function handleInteractions(frame,delta,pose){
    //reset materials
    for (const interactableObject of iao) {
        if(interactableObject.materialKeep) interactableObject.material = interactableObject.materialKeep;
    }
    
    for (const source of xrSession.inputSources) {
        if(source.targetRaySpace){
            const targetRay = frame.getPose(source.targetRaySpace,xrReferenceSpace);
            
            //console.log(targetRay.transform.position);
            if(targetRay){
                const targetRaySpace = transformToGlobalLocation(targetRay);

                //show item
                if(holding[source.handedness] != null) {
                    holding[source.handedness].position.copy(targetRaySpace.currentPosition);
                    //holding[source.handedness].quaternion.copy(targetRaySpace.orientation);
                }

                for (const interactableObject of iao) {
                    
                    let distance = interactableObject.position.distanceTo(targetRaySpace.currentPosition);
                    
                    if(distance < 0.2 && !interactableObject.keepInteract) {
                        if(!interactableObject.materialKeep) interactableObject.materialKeep = interactableObject.material;
                        interactableObject.material = highlightMaterial;
                    }
                } 
            }
        }
    }
}

function startElevatorTravel(elevator){
    elevator.userData.traveling = true;
    elevator.userData.traveledDistance = 0;
    elevator.userData.acceleration = elevatorIntialVelocity;
    //ground.type = CANNON.Body.DYNAMIC;
    //ground.mass = 0;
    //ground.updateMassProperties();
    //ground.aabbNeedsUpdate = true;

    let particle = generateElevatorParticles(new THREE.Vector3());
    
    particleSystems.push(particle);
    scene.add(particle);
}

function generateElevatorParticles(vec){
    let particles = new THREE.Geometry();
    //particles
    for (var p = 0; p < elevatorParticlesCount; p++) {
        // create a particle with random
        var pX = Math.random() * elevatorParticleSquare - (elevatorParticleSquare*0.5),
            pY = Math.random() * elevatorParticleHeight - (elevatorParticleHeight*0.5),
            pZ = Math.random() * elevatorParticleSquare - (elevatorParticleSquare*0.5),
            particle = new THREE.Vector3(pX, pY, pZ);
            particle.add(vec);
        // add it to the geometry
        particles.vertices.push(particle);
    }
    let particleSystem = new THREE.Points(particles,elevatorParticleMaterial);
    
    return particleSystem;
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

//controller GAMEPAD (virtual player movement)
function handleInputs(frame,delta,pose){
    let playerHeadSpace = transformToGlobalLocation(pose);
    //iterate all available input devices
    for (const source of xrSession.inputSources) {
        const axes = source.gamepad.axes;

        //check if joycon input available
        if(axes[2] && axes[3]){
            if(source.handedness === "left"){
                handleLeftGamepadInput(playerHeadSpace,axes[2],axes[3]);
            }else if(source.handedness === "right"){
                handleRightGamepadInput(playerHeadSpace,axes[2],axes[3]);
            }
        }
    }
}

let offsetPos = new THREE.Vector3();
function handleLeftGamepadInput(playerHeadSpace,xAxis,yAxis){
    //get gamepad input
    offsetPos.set(xAxis,0,yAxis);

    //apply playerSpeed
    offsetPos.multiplyScalar(playerSpeed);
    
    //apply head rotation and camera parent rotation
    offsetPos.applyQuaternion(playerHeadSpace.orientation);
    offsetPos.applyQuaternion(user.quaternion);

    //apply movement
    playerBox.velocity.x = offsetPos.x;
    playerBox.velocity.z = offsetPos.z;
}

const yVector = new THREE.Vector3(0,1,0);
let timeout;
let allowRotation = true;
function handleRightGamepadInput(playerHeadSpace,xAxis,yAxis){
    if(xAxis > -0.5 && xAxis < 0.5){
        allowRotation = true;
        clearInterval(timeout);
    }else{
        if(allowRotation){
            allowRotation = false;
            const angle = (xAxis > 0) ? -playerRotationAngle : playerRotationAngle;
            user.rotateAroundWorldAxis(playerHeadSpace.currentPosition,yVector,angle);
            timeout = setTimeout(function(){allowRotation = true;},playerRotationTimeout);
        }
    }
}

//physics and real position matching(real player movements)
let deltaPosition = new THREE.Vector3();
let rotatedDelta = new THREE.Vector3();
function updateAndMatchPhysics(delta,pose){
    //update physics world
    physicsWorld.step(delta);

    //get current Playe height
    playerHeight.setY(pose.transform.position.y);

    //calculate movement delta
    deltaPosition.sub(pose.transform.position);
    rotatedDelta.copy(deltaPosition);
    rotatedDelta.setY(0);
    rotatedDelta.applyQuaternion(user.quaternion);
    playerBox.position.vsub(rotatedDelta,playerBox.position);
    //reset delta
    deltaPosition.copy(pose.transform.position);

    //match current Playerposition to physical Position
    moveVirtualPlayerToMatch(pose,playerBox.position);
}

let rotatedTransformVector = new THREE.Vector3();
let currentTransformVector = new THREE.Vector3();
function transformToGlobalLocation(space){
    //const orientation = new THREE.Quaternion().copy(space.transform.orientation);
    rotatedTransformVector.copy(space.transform.position).applyQuaternion(user.quaternion);
    currentTransformVector.copy(user.position).add(rotatedTransformVector);

    return {orientation:space.transform.orientation,currentPosition:currentTransformVector};
}

let rotatedLocalPosition = new THREE.Vector3();
let virtualMatchPosition = new THREE.Vector3();
function moveVirtualPlayerToMatch(space, position){
    rotatedLocalPosition.copy(space.transform.position).applyQuaternion(user.quaternion);
    virtualMatchPosition.copy(position).add(rotatedLocalPosition.negate());

    user.position.copy(virtualMatchPosition.add(playerHeight));
} 

//support functions
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