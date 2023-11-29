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

function triangleNormal(vertices) {
  // assumes vertices is a Float32Array where each three numbers is a triangle vertex
  const a = new Vector3(vertices[0], vertices[1], vertices[2]);
  const b = new Vector3(vertices[3], vertices[4], vertices[5]);
  const c = new Vector3(vertices[6], vertices[7], vertices[8]);

  return b.sub(a).cross(c.sub(a)).normalize();
}

function triangleColor(normal) {
  // use the x direction to pick between the darkest and lightest gray
  // normal is a unit vector, so x is between -1 and 1
  const xScale = (normal.x + 1) / 2;

  const darkestGray = 0x22;
  const lightestGray = 0x99;

  const gray = Math.floor(xScale * (darkestGray - lightestGray) + lightestGray);

  const r = gray << 16;
  const g = gray << 8;
  const b = gray;
  return r + g + b;
}

export class TriangleMesh extends Mesh {
  constructor(vertices) {
    /*
    const vertices = new Float32Array([
      0,
      0,
      0, // v0
      1,
      0,
      0, // v1
      1,
      1,
      0, // v2
    ]);
    */

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    const normal = triangleNormal(vertices);
    const color = triangleColor(normal);
    console.log(normal);
    console.log(color.toString(16));
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
