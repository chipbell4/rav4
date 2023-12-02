import {
  EdgesGeometry,
  LineSegments,
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  MeshBasicMaterial,
  BufferAttribute,
  Mesh,
  DoubleSide,
} from "three";

function triangleNormal(vertices: Vector3[]) {
  const [a, b, c] = vertices;
  return b.clone().sub(a).cross(c.clone().sub(a)).normalize();
}

function triangleColor(normal) {
  // use the x direction to pick between the darkest and lightest gray
  // normal is a unit vector, so x is between -1 and 1
  const xScale = (normal.x + 1) / 2;

  const darkestGray = 0x00;
  const lightestGray = 0xbb;

  const gray = Math.floor(xScale * (darkestGray - lightestGray) + lightestGray);

  const r = gray << 16;
  const g = gray << 8;
  const b = gray;
  return r + g + b;
}

export class TriangleMesh extends Mesh {
  constructor(vertices: Vector3[]) {
    const geometry = new BufferGeometry();
    const bufferData = new Float32Array([
      vertices[0].x,
      vertices[0].y,
      vertices[0].z,
      vertices[1].x,
      vertices[1].y,
      vertices[1].z,
      vertices[2].x,
      vertices[2].y,
      vertices[2].z,
    ])
    geometry.setAttribute("position", new BufferAttribute(bufferData, 3));

    const normal = triangleNormal(vertices);
    const color = triangleColor(normal);
    const material = new MeshBasicMaterial({
      color,
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
