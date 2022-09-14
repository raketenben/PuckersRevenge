import { XRControllerModelFactory } from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';
import LevelLoader from './lib/levelLoader.js';
import HitboxGenerator from './lib/hitboxGenerator.js';
import InputManager from './lib/inputManager.js';

const canvas = document.getElementById("game");
const enterVrButton = document.getElementById("enterVR");
const enterDesktopButton = document.getElementById("enterDesktop");
const progressDisplay = document.getElementById("progress");

function updateButtons() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
            if (supported) {
                enterVrButton.classList.remove("hidden");
            } else {
                enterVrButton.innerHTML = "VR not supported";
                enterDesktopButton.classList.remove("hidden");
            }
        });
    } else {
        enterVrButton.innerHTML = "VR not supported";
    }
}

//xr session events   
enterVrButton.addEventListener("click", function() {
    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };
    if (!xrSession) {
        navigator.xr.requestSession('immersive-vr', sessionInit).then((ses) => {
            renderer.xr.setSession(ses);
        });
    } else {
        enterVrButton.innerHTML = "Enter VR";
        xrSession.end();
    }
});

enterDesktopButton.addEventListener("click", onDesktopStart);

//physics materials
const defaultMaterial = new CANNON.Material({ name: "default" });
const playerMaterial = new CANNON.Material({ name: "player" });
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, playerMaterial, {
    friction: 0.01,
    restitution: 0.0,
});

//desktop player settings
const playerHeightDesktop = 1.55;
const playerMouseSenseDesktop = (Math.PI / 180) * 0.25;
const playerCursorRadiusDesktop = 64;

//player settings
const playerSpeed = 1.5;
const playerSprintFactor = 1;
const playerZoomFactorDektop = 4;
const playerRotationTimeout = 350;
const playerRotationAngle = (Math.PI / 180) * 30;

//interaction settings
const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffc100 });

//LEVEL loading (travel)
const elevatorTravelDistance = 100;
const elevatorIntialVelocity = 0.05;
const elevatorAcceleration = 1.04;
const elevatorTravelSpeed = 5;
const elevatorParticleSquare = 10;
const elevatorParticleHeight = 500;
const elevatorParticlesCount = 4000;
const elevatorParticleMaterial = new THREE.PointsMaterial({ color: 0x333333, size: 0.005 });

const levelLoader = new LevelLoader();
const controllerModelFactory = new XRControllerModelFactory();

const raycaster = new THREE.Raycaster();

let playerHeight = new THREE.Vector3(0, 0, 0);

let hitboxGenerator = new HitboxGenerator(defaultMaterial);
let inputManager = new InputManager();

let currentEntryPosition;
let currentExitPosition;

let stats, clock;
let camera, camera1, scene, renderer;
let xrSession, xrReferenceSpace;
let user;
let physicsWorld, playerBox, testChamber;
let holding = { left: null, right: null };

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
    scene.fog = new THREE.FogExp2(0x000, 0.1);
    scene.background = new THREE.Color("#000000");

    //add additional light to scene
    const hemiLight = new THREE.HemisphereLight(0xFFF9CC, 0x000000, 4);
    //scene.add(hemiLight);

    //add user to scene
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10);
    user = new THREE.Group();
    user.add(camera);
    scene.add(user);

    //setup renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, powerPreference: "high-performance", precision: "highp" });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.extensions.get("OCULUS_multiview");
    renderer.extensions.get("OVR_multiview2");

    //physics
    physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0, -9.82, 0);
    physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    physicsWorld.defaultContactMaterial = defaultContactMaterial;
    physicsWorld.addContactMaterial(defaultContactMaterial);

    //add hitbox
    let shape1 = new CANNON.Sphere(0.075);
    playerBox = new CANNON.Body({ mass: 65, material: playerMaterial });
    playerBox.angularDamping = 1;
    playerBox.type = CANNON.Body.DYNAMIC;
    playerBox.position.y = 0.01;

    playerBox.addShape(shape1, new CANNON.Vec3(0, 0.10, 0));
    physicsWorld.addBody(playerBox);

    //utilities
    stats = new Stats();
    clock = new THREE.Clock();
    cannonDebug = new THREE.CannonDebugRenderer(scene, physicsWorld);

    //show stats
    document.body.appendChild(stats.domElement);

    renderer.xr.addEventListener('sessionstart', sessionStarted);
    renderer.xr.addEventListener('sessionend', sessionEnded);

    //level loader
    levelLoader.init(scene, renderer, physicsWorld, defaultMaterial).then(() => {
        levelLoader.load("test1", new THREE.Vector3(0, 0, 0), (levelFile) => {

            let i = 1;
            console.log(scene.children[i + 1].userData.hitboxes)
                //hitboxGenerator.updateBodyFromJSON(physicsWorld.bodies[i],scene.children[i+1].userData.hitboxes[1]);

            //currentEntryPosition = (new THREE.Vector3()).copy(levelFile.levelEntry);
            //console.log(currentEntryPosition)

            for (let x in scene.children) {
                scene.children[x].traverse((obj) => {
                    if (obj?.userData ?.attributes ?.interactable) {
                        obj.index = x;
                        iao.push(obj);
                    }
                });
            }

            console.log("finished loading");
            progressDisplay.classList.add("hidden");
            renderer.render(scene, camera);
        }, (xhr) => {
            let progress = Math.round((xhr.loaded / xhr.total) * 1000) / 10;
            progressDisplay.innerHTML = `Object ${xhr.objectLoaded}/${xhr.objectTotal} </br> ${progress} % - ${xhr.tag}`;
            updateButtons();
        }, (err) => {
            console.error(err)
        })
    });
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'visible') {
        clock.getDelta();
    }
});

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function sessionEnded() {
    xrSession = null;
    enterVrButton.innerHTML = "Enter VR";
    renderer.setAnimationLoop(null);
}

function sessionStarted(event) {
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

    xrSession.addEventListener("squeezestart", handleSelect);
    xrSession.addEventListener("squeezeend", handleSelectEnd);

    renderer.setAnimationLoop(drawFrame);
}

let pointerLockState = false;

function onDesktopStart() {
    document.getElementById("ui").classList.add("hidden")
    camera.position.y = playerHeightDesktop;

    document.addEventListener('pointerlockchange', pointerLockChanged, false);

    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
    renderer.domElement.requestPointerLock();

    document.addEventListener("mousemove", handleMousemovementDesktop, false);
    //document.addEventListener('keydown', handleKeyDownDesktop, false);
    //document.addEventListener('keyup', handleKeyUpDesktop, false);
    document.addEventListener("click", recaptureMouse, false);

    clock.getDelta()

    renderer.setAnimationLoop(drawDesktopFrame);
}

function pointerLockChanged() {
    if (document.pointerLockElement === renderer.domElement) {
        pointerLockState = true;
    } else {
        pointerLockState = false;
    }
}

function recaptureMouse() {
    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
    renderer.domElement.requestPointerLock();
}

function handleInteractionsDesktop(v) {
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const objects = raycaster.intersectObjects(scene.children);

    for (const hit of objects) {
        //console.log(hit.object);
    }
}

let playerDesktopView = [0, 0];

function handleMousemovementDesktop(e) {
    if (pointerLockState == true) {
        if (e.movementX > playerCursorRadiusDesktop) return;
        if (e.movementX < -playerCursorRadiusDesktop) return;
        if (e.movementY > playerCursorRadiusDesktop) return;
        if (e.movementY < -playerCursorRadiusDesktop) return;

        playerDesktopView[0] -= e.movementX * playerMouseSenseDesktop;
        if (
            playerDesktopView[1] - e.movementY * playerMouseSenseDesktop < Math.PI / 2 &&
            playerDesktopView[1] - e.movementY * playerMouseSenseDesktop > -Math.PI / 2
        ) playerDesktopView[1] -= e.movementY * playerMouseSenseDesktop;

        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = playerDesktopView[1];
        euler.y = playerDesktopView[0];
        camera.quaternion.setFromEuler(euler);
    }
}

function handleInputsDesktop() {
    //get gamepad input
    offsetPos.set((inputManager.get("a") ? -1 : (inputManager.get("d") ? 1 : 0)), 0, (inputManager.get("w") ? -1 : (inputManager.get("s") ? 1 : 0)));

    //slow down if multiple directions
    offsetPos.multiplyScalar(1.2 * ((Math.abs(Math.abs(offsetPos.x) - Math.abs(offsetPos.z)) / 2) + 0.5));

    //apply playerSpeed
    offsetPos.multiplyScalar(playerSpeed);
    if (inputManager.get("control")) offsetPos.multiplyScalar(playerSprintFactor);

    //apply head rotation and camera parent rotation
    offsetPos.applyQuaternion(camera.quaternion);
    //offsetPos.applyQuaternion(user.quaternion);

    //apply movement
    playerBox.velocity.x = offsetPos.x;
    playerBox.velocity.z = offsetPos.z;
}

function findClipsByName(animations, names) {
    var ret = new Array();
    for (const i in names) {
        var clip = THREE.AnimationClip.findByName(animations, names[i]);
        if (clip) ret.push(clip);
    }
    return ret;
}

let delta = 0;
let pose = null;

function drawFrame(frameTime, frame) {
    stats.begin();

    delta = clock.getDelta();
    pose = frame.getViewerPose(xrReferenceSpace);

    //animations
    //mixer.update( delta);

    //handleElevators(frame,delta,pose);

    handleInputs(frame, delta, pose);
    handleInteractions(frame, delta, pose);

    updateAndMatchPhysics(delta, pose);

    //cannonDebug.update();

    renderer.render(scene, camera);
    stats.end();
}

function drawDesktopFrame(frameTime, frame) {

    delta = clock.getDelta();
    pose = { transform: { position: { x: 0, y: playerHeightDesktop, z: 0 } } };

    if (pointerLockState == true) {
        stats.begin();
        //animations
        //mixer.update(delta);

        //handleElevators(frame,delta,pose);

        handleInputsDesktop(frame, delta);
        handleInteractionsDesktop(frame, delta);

        updateAndMatchPhysics(delta, pose);

        //cannonDebug.update();

        renderer.render(scene, camera);

        stats.end();
    }

}

function handleElevators(frame, delta, pose) {

    for (let c = 0; c < particleSystems.length; c++) {
        for (var x = 0; x < particleSystems[c].geometry.vertices.length; x++) {
            if (particleSystems[c].geometry.vertices[x].y > (elevatorParticleHeight * 0.5)) {
                particleSystems[c].geometry.vertices[x].y = -(elevatorParticleHeight * 0.5);
            }
            //particleSystems[c].geometry.vertices[x].y += elevatorTravelSpeed * delta;
        }
        particleSystems[c].geometry.verticesNeedUpdate = true;
    }

    //elevator
    for (let c = 0; c < elevators.length; c++) {
        if (elevators[c].userData.traveling) {
            if (elevators[c].userData.acceleration < elevatorTravelSpeed) elevators[c].userData.acceleration *= elevatorAcceleration;
            elevators[c].userData.traveledDistance += elevators[c].userData.acceleration * delta;
            testChamber.velocity.y = -elevators[c].userData.acceleration;
            if (elevators[c].userData.traveledDistance > elevatorTravelDistance) {
                elevators[c].userData.traveling = false;
            }
        } else {
            testChamber.velocity.y = 0;
        }
        elevators[c].position.copy(testChamber.position);
    }
}

//TODO:REWRITE
function handleInteractions(frame, delta, pose) {
    for (const source of xrSession.inputSources) {
        if (source.targetRaySpace) {
            const targetRay = frame.getPose(source.targetRaySpace, xrReferenceSpace);

            if (targetRay ?.transform) {
                const targetRaySpace = transformToGlobalLocation(targetRay);

                console.log(targetRaySpace)
                    //show item
                if (holding[source.handedness] != null) {
                    physicsWorld.bodies[holding[source.handedness].index].type = CANNON.Body.KINEMATIC;
                    physicsWorld.bodies[holding[source.handedness].index].position.copy(targetRaySpace.currentPosition);
                    console.log(physicsWorld.bodies[holding[source.handedness].index])
                    physicsWorld.bodies[holding[source.handedness].index].quaternion.copy(targetRaySpace.orientation);
                    //holding[source.handedness].quaternion.copy(targetRaySpace.orientation);
                }
            }
        }
    }
}

function startElevatorTravel(elevator) {
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

function generateElevatorParticles(vec) {
    let particles = new THREE.Geometry();
    //particles
    for (var p = 0; p < elevatorParticlesCount; p++) {
        // create a particle with random
        var pX = Math.random() * elevatorParticleSquare - (elevatorParticleSquare * 0.5),
            pY = Math.random() * elevatorParticleHeight - (elevatorParticleHeight * 0.5),
            pZ = Math.random() * elevatorParticleSquare - (elevatorParticleSquare * 0.5),
            particle = new THREE.Vector3(pX, pY, pZ);
        particle.add(vec);
        // add it to the geometry
        particles.vertices.push(particle);
    }
    let particleSystem = new THREE.Points(particles, elevatorParticleMaterial);

    return particleSystem;
}

function handleSelect(eve) {
    const targetRay = eve.frame.getPose(eve.inputSource.targetRaySpace, xrReferenceSpace);
    const targetRaySpace = transformToGlobalLocation(targetRay);
    for (const interactableObject of iao) {

        let distance = interactableObject.position.distanceTo(targetRaySpace.currentPosition);
        //marker.position.copy(targetRaySpace.currentPosition);
        let realPos = new THREE.Vector3();
        interactableObject.getWorldPosition(realPos);
        //marker1.position.copy(realPos);

        console.log("eve", eve, distance);
        if (distance < 0.2) {
            holding[eve.inputSource.handedness] = interactableObject;
        }
    }
}

function handleSelectEnd(eve) {
    physicsWorld.bodies[holding[eve.inputSource.handedness].index].type = CANNON.Body.DYNAMIC;
    if (holding[eve.inputSource.handedness]) holding[eve.inputSource.handedness] = null;
}

//controller GAMEPAD (virtual player movement)
function handleInputs(frame, delta, pose) {
    let playerHeadSpace = transformToGlobalLocation(pose);
    //iterate all available input devices
    for (const source of xrSession.inputSources) {
        const axes = source.gamepad.axes;

        //check if joycon input available
        if (axes[2] && axes[3]) {
            if (source.handedness === "left") {
                handleLeftGamepadInput(playerHeadSpace, axes[2], axes[3]);
            } else if (source.handedness === "right") {
                handleRightGamepadInput(playerHeadSpace, axes[2], axes[3]);
            }
        }
    }
}

let offsetPos = new THREE.Vector3();

function handleLeftGamepadInput(playerHeadSpace, xAxis, yAxis) {
    //get gamepad input
    offsetPos.set(xAxis, 0, yAxis);

    //apply playerSpeed
    offsetPos.multiplyScalar(playerSpeed);

    offsetPos.applyQuaternion(playerHeadSpace.orientation);
    offsetPos.applyQuaternion(user.quaternion);

    //apply movement
    playerBox.velocity.x = offsetPos.x;
    playerBox.velocity.z = offsetPos.z;
}

const yVector = new THREE.Vector3(0, 1, 0);
let timeout;
let allowRotation = true;

function handleRightGamepadInput(playerHeadSpace, xAxis, yAxis) {
    if (xAxis > -0.5 && xAxis < 0.5) {
        allowRotation = true;
        clearInterval(timeout);
    } else {
        if (allowRotation) {
            allowRotation = false;
            const angle = (xAxis > 0) ? -playerRotationAngle : playerRotationAngle;
            user.rotateAroundWorldAxis(playerHeadSpace.currentPosition, yVector, angle);
            timeout = setTimeout(function() { allowRotation = true; }, playerRotationTimeout);
        }
    }
}

//physics and real position matching(real player movements)
let deltaPosition = new THREE.Vector3();
let rotatedDelta = new THREE.Vector3();

function updateAndMatchPhysics(delta, pose) {
    //update physics world
    physicsWorld.step(1 / 60, delta);

    //update object positions to physics
    for (let i = 1; i < physicsWorld.bodies.length; i++)
        if (scene.children[i]) {
            scene.children[i].position.copy(physicsWorld.bodies[i].position);
            scene.children[i].quaternion.copy(physicsWorld.bodies[i].quaternion);
        }

        //get current Playe height
    playerHeight.setY(pose.transform.position.y);

    //calculate movement delta
    deltaPosition.sub(pose.transform.position);
    rotatedDelta.copy(deltaPosition);
    rotatedDelta.setY(0);
    rotatedDelta.applyQuaternion(user.quaternion);

    playerBox.position.vsub(rotatedDelta, playerBox.position);
    //reset delta
    deltaPosition.copy(pose.transform.position);

    //match current Playerposition to physical Position
    moveVirtualPlayerToMatch(pose, playerBox.position);
}

let rotatedTransformVector = new THREE.Vector3();
let currentTransformVector = new THREE.Vector3();

function transformToGlobalLocation(space) {
    rotatedTransformVector.copy(space.transform.position).applyQuaternion(user.quaternion);
    currentTransformVector.copy(user.position).add(rotatedTransformVector);

    return { orientation: space.transform.orientation, currentPosition: currentTransformVector };
}

let rotatedLocalPosition = new THREE.Vector3();
let virtualMatchPosition = new THREE.Vector3();

function moveVirtualPlayerToMatch(space, position) {
    rotatedLocalPosition.copy(space.transform.position).applyQuaternion(user.quaternion);
    virtualMatchPosition.copy(position).add(rotatedLocalPosition.negate());

    user.position.copy(virtualMatchPosition.add(playerHeight));
}

//support functions
THREE.Object3D.prototype.getObjectByUserDataProperty = function(name, value) {
    var list = new Array();

    if (this.userData[name] === value) return this;
    for (var i = 0, l = this.children.length; i < l; i++) {

        var child = this.children[i];
        var object = child.getObjectByUserDataProperty(name, value);

        if (object !== undefined) {
            if (Array.isArray(object)) {
                list = list.concat(object);
            } else {
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

    return function rotateAroundWorldAxis(point, axis, angle) {
        q.setFromAxisAngle(axis, angle);

        this.applyQuaternion(q);

        this.position.sub(point);
        this.position.applyQuaternion(q);
        this.position.add(point);

        return this;
    }
}();