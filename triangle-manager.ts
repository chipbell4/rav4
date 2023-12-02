import { BufferGeometry, Mesh, Scene, Vector3 } from "three";
import { TriangleMesh } from "./triangle-mesh";

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

interface ContourProps {
  x: {
    min: number;
    max: number;
    step: number;
  };
  y: {
    min: number;
    max: number;
  };
}

const CONTOUR_CONFIG: ContourProps = {
  x: {
    min: -10,
    max: 10,
    step: 1,
  },
  y: {
    min: -0.4,
    max: 0.4,
  },
};

const TRIANGLE_DEPTH = 1.0;
const ROW_COUNT = 20;

function generateContour(config: ContourProps): number[] {
  const values: number[] = [];

  for (let x = config.x.min; x <= config.x.max; x += config.x.step) {
    const y = rand(config.y.min, config.y.max); // TODO: Be smoother here?
    values.push(y);
  }

  return values;
}

function generateContours(config: ContourProps, rowCount: number): number[][] {
  const contours: number[][] = [];
  for (let i = 0; i < rowCount; i++) {
    contours.push(generateContour(config));
  }

  // add the first item back in again so that the contours are "seamless"
  contours.push(contours[0]);

  return contours;
}

function createRow(
  z0: number,
  currentContour: number[],
  nextContour: number[],
): TriangleMesh[] {
  const row: TriangleMesh[] = [];

  for (let i = 0; i < nextContour.length - 1; i++) {
    const t0 = i / (nextContour.length - 1);
    const t1 = (i + 1) / (nextContour.length - 1);
    const x0 =
      CONTOUR_CONFIG.x.min + t0 * (CONTOUR_CONFIG.x.max - CONTOUR_CONFIG.x.min);
    const x1 =
      CONTOUR_CONFIG.x.min + t1 * (CONTOUR_CONFIG.x.max - CONTOUR_CONFIG.x.min);
    const y0Front = currentContour[i];
    const y1Front = currentContour[i + 1];
    const y0Back = nextContour[i];
    const y1Back = nextContour[i + 1];

    // define 4 points two make two triangles
    const frontLeft = new Vector3(x0, y0Front, 0);
    const frontRight = new Vector3(x1, y1Front, 0);
    const backLeft = new Vector3(x0, y0Back, -TRIANGLE_DEPTH);
    const backRight = new Vector3(x1, y1Back, -TRIANGLE_DEPTH);

    const left = new TriangleMesh([frontLeft, frontRight, backLeft]);
    const right = new TriangleMesh([frontRight, backLeft, backRight]);

    left.position.z = z0;
    right.position.z = z0;

    row.push(left, right);
  }

  return row;
}

export class TriangleManager {
  scene: Scene;
  rows: TriangleMesh[][];
  frontRowIndex: number;

  constructor(scene: Scene) {
    this.scene = scene;
    this.rows = [];

    const contours = generateContours(CONTOUR_CONFIG, ROW_COUNT);
    let z0 = 5;

    // Create all the triangles
    for (let i = 0; i < contours.length - 1; i++) {
      const row = createRow(z0, contours[i], contours[i + 1]);
      this.rows.push(row);
      z0 -= TRIANGLE_DEPTH;
    }

    // Add all triangles to the scene
    for (const row of this.rows) {
      for (const triangle of row) {
        this.scene.add(triangle);
      }
    }

    this.frontRowIndex = 0;
  }

  moveTriangles(dt: number) {
    const VELOCITY = 2.0;
    for (const row of this.rows) {
      for (const triangle of row) {
        triangle.position.z += dt * VELOCITY;
      }
    }
  }

  recycleTriangles() {
    const PRUNE_Z = 6; // TODO: Tune for performance.

    const frontRow = this.rows[this.frontRowIndex];
    const backRowIndex = (this.frontRowIndex + ROW_COUNT - 1) % ROW_COUNT;
    const backRowZ = this.rows[backRowIndex][0].position.z;

    if (frontRow[0].position.z > PRUNE_Z) {
      // move this row to the back, and then move the current known front row index to the next row
      for (const triangle of frontRow) {
        triangle.position.z = backRowZ - TRIANGLE_DEPTH;
      }

      this.frontRowIndex = (this.frontRowIndex + 1) % ROW_COUNT;
    }
  }

  update(dt: number) {
    this.moveTriangles(dt);
    this.recycleTriangles();
  }
}
