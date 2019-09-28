var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
var cube = new THREE.Mesh(geometry, material);

scene.add(cube);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

camera.position.set(0, 20, 100);
controls.update();

function draw() {
	requestAnimationFrame(draw);

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	controls.update();
	renderer.render(scene, camera);
}

draw();