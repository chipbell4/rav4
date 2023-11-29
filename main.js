import * as THREE from "three";
import { camera } from "./camera";
import { TriangleMesh } from "./triangle-mesh";
import { TriangleManager } from "./triangle-manager";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const manager = new TriangleManager(scene);

camera.position.y = 2;
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  manager.moveTriangles(1 / 60);

  renderer.render(scene, camera);
}
animate();
