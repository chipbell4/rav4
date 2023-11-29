import { Scene } from "three";
import { TriangleMesh } from "./triangle-mesh";

function rand(a: number, b: number): number {
    return a + Math.random() * (b - a);
}

interface ContourProps {
    x: {
        min: number;
        max: number;
        step: number;
    }
    y: {
        min: number;
        max: number;
    }
}

function generateContour(config: ContourProps): number[] {
    const values: number[] = [];

    for (let x = config.x.min; x <= config.x.max; x += config.x.step) {
        const y = rand(config.y.min, config.y.max); // TODO: Be smoother here?
        values.push(y);
    }

    return values;
}

const CONTOUR_CONFIG: ContourProps = {
    x: {
        min: -10,
        max: 10,
        step: 1,
    },
    y: {
        min: -0.2,
        max: 0.2,
    }
}

const TRIANGLE_DEPTH = 1.0;

export class TriangleManager {
    scene: Scene;
    triangles: TriangleMesh[];
    currentContour: number[];
    currentZ: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.triangles = [];
        this.currentContour = generateContour(CONTOUR_CONFIG);
        this.currentZ = 0;

        this.addRow();
    }

    addRow() {
        const nextContour = generateContour(CONTOUR_CONFIG);

        for (let i = 0; i < nextContour.length - 1; i++) {
            const t0 = i / nextContour.length;
            const t1 = (i + 1) / nextContour.length;
            const x0 = CONTOUR_CONFIG.x.min + t0 * (CONTOUR_CONFIG.x.max - CONTOUR_CONFIG.x.min);
            const x1 = CONTOUR_CONFIG.x.min + t1 * (CONTOUR_CONFIG.x.max - CONTOUR_CONFIG.x.min);
            const y0Front = this.currentContour[i];
            const y1Front = this.currentContour[i+1];
            const y0Back = nextContour[i];
            const y1Back = nextContour[i+1];
            const z0 = this.currentZ;
            const z1 = this.currentZ + TRIANGLE_DEPTH;

            // define 4 points two make two triangles
            const frontLeft = [x0, y0Front, z0];
            const frontRight = [x1, y1Front, z0];
            const backLeft = [x0, y0Back, z1];
            const backRight = [x1, y1Back, z1];

            const left = new TriangleMesh(new Float32Array([
                ...frontLeft,
                ...frontRight,
                ...backLeft,
            ]));
            const right = new TriangleMesh(new Float32Array([
                ...frontRight,
                ...backLeft,
                ...backRight,
            ]));

            this.triangles.push(left, right);
            this.scene.add(left);
            this.scene.add(right);
        }

        this.currentZ -= TRIANGLE_DEPTH;
    }

    moveTriangles(dt) {
        const VELOCITY = 1.0;
        for (const triangle of this.triangles) {
            triangle.position.z += dt * VELOCITY;
        }

        this.currentZ += dt * VELOCITY;
    }

    pruneInvisible() {
        const PRUNE_Z = 20; // TODO: Tune for performance.

        const keepers: TriangleMesh[] = [];
        for (const triangle of this.triangles) {
            triangle.geometry.computeBoundingBox();
            if(triangle.geometry.boundingBox!.min.z > PRUNE_Z) {
                this.scene.remove(triangle);
            } else {
                keepers.push(triangle);
            }
        }

        this.triangles = keepers;
    }
}