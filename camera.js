import { PerspectiveCamera, Vector3 } from "three";

export const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

export function tiltCamera(x, y) {
    const CAMERA_SCALE = 2;

    camera.lookAt(new Vector3(x * CAMERA_SCALE, -y * CAMERA_SCALE, 0));
}

document.addEventListener("mousemove", (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const x = (e.clientX - centerX) / window.innerWidth;
    const y = (e.clientY - centerY) / window.innerHeight;
    tiltCamera(x, y);
});