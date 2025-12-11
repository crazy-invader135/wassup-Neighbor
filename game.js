import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add simple lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2; // Rotate to lay flat
scene.add(plane);

// Add a simple block to walk around
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(5, 1, 0);
scene.add(box);

// Initial camera position (our "first person" view)
camera.position.set(0, 1.7, 5); // 1.7 meters for a typical eye level

// --- First Person Movement Variables ---
const moveSpeed = 0.1;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Handle Keyboard Input
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
});

// Handle Mouse Look (Rotation)
// This is a simplified rotation and often requires a "Pointer Lock" API for a real FPS game.
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
});

renderer.domElement.addEventListener('mouseup', (e) => {
    isDragging = false;
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    // Yaw (left/right rotation) is applied to the camera's Y axis
    camera.rotation.y -= deltaX * 0.005; 
    
    // Pitch (up/down rotation) is applied to the camera's X axis (clamped to prevent flipping)
    // A true FPS setup would use an object (like a character body) to handle Yaw 
    // and the camera (child of the object) to handle Pitch.
    camera.rotation.x -= deltaY * 0.005;
    
    // Basic clamping for pitch (look up/down)
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// --- Game Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Get the direction the camera is currently facing
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Create a vector for side movement (strafe)
    const strafeDirection = new THREE.Vector3();
    strafeDirection.crossVectors(camera.up, direction);
    
    // Apply movement
    if (moveForward) camera.position.addScaledVector(direction, moveSpeed);
    if (moveBackward) camera.position.addScaledVector(direction, -moveSpeed);
    if (moveLeft) camera.position.addScaledVector(strafeDirection, moveSpeed);
    if (moveRight) camera.position.addScaledVector(strafeDirection, -moveSpeed);

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
