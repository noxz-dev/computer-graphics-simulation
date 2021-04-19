import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three'

/**
 * Wrapper-Class fpr creating a sphere object
 */
export default class Sphere extends Mesh {
  /**
   * Initializes a new Sphere object
   *
   * @param {number} radius The radius of the sphere
   * @param {number} widthSegments The amount of longitude segments
   * @param {number} heightSegments The amount of latitude segments
   * @param {boolean} [transparent = true] If the sphere should be transparent
   * @param {number} [opacity = 1.0] The opacity of the sphere
   * @param {number} [color = 0xffffff] The color of the sphere in hexadecimal
   */
  constructor(radius, widthSegments, heightSegments, transparent = false, opacity = 1, color = 0xffffff) {
    const geometry = new SphereGeometry(radius, widthSegments, heightSegments)
    const material = new MeshBasicMaterial({
      color: color,
      transparent: transparent,
      opacity: opacity
    })
    super(geometry, material)
  }

  /**
   * Updates the position of the sphere
   *
   * @param {Vector3} point The new position
   */
  updatePosition(point) {
    this.position.copy(point)
  }

  /**
   * Sets the Color for the sphere from a given angle
   *
   * @param {number} degree hue degree
   */
  setHSLColor(degree) {
    this.material.color.setHSL(degree, 1, 0.5)
  }
}
