import { Mesh, CircleGeometry, MeshBasicMaterial, DoubleSide } from 'three'

/**
 * Wrapper-Class for creating a circle object.
 */
export default class Circle extends Mesh {
  /**
   * Initializes a circle object
   *
   * @param {number} radius The radius of the circle object
   * @param {number} segments The number of triangular segments that circle should be created with
   * @param {number} [color = 0xf39c12] The color of the circle object in hexadecimal
   */
  constructor(radius, segments, color = 0xf39c12) {
    const geometry = new CircleGeometry(radius, segments)
    const material = new MeshBasicMaterial({ color: color })
    material.side = DoubleSide
    super(geometry, material)
  }

  /**
   * Updates the position of the circle
   *
   * @param {Vector3} point The new position
   * @param {Vector3} normal The new normal for orientation
   */
  updatePosition(point, normal) {
    this.position.copy(point).add(normal)
  }
}
