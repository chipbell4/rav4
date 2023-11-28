import { EdgesGeometry } from "three";
import { LineSegments } from "three";
import { LineBasicMaterial } from "three";
import { BufferGeometry, MeshBasicMaterial } from "three";
import { BufferAttribute, Mesh, DoubleSide } from "three";

export class TriangleMesh extends Mesh {
    constructor() {
        const vertices = new Float32Array([
            0, 0, 0, // v0
            1, 0, 0, // v1
            1, 1, 0, // v2
        ]);

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(vertices, 3));

        const material = new MeshBasicMaterial({
            color: 0xff0000,
            side: DoubleSide,
        });

        super(geometry, material);

        // Add the wireframe as well, so we can color the edges
        // see: https://stackoverflow.com/a/40858869
        const wireframeGeometry = new EdgesGeometry(this.geometry);
        const wireframeMaterial = new LineBasicMaterial({
            color: 0xffffff,
            linewidth: 5,
        });
        const edges = new LineSegments(wireframeGeometry, wireframeMaterial);
        this.add(edges);
    }
}