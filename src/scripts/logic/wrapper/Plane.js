import { Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide } from 'three'

/**
 * Wrapper-Class for creating a plane object
 */
export default class Plane extends Mesh {
  /**
   * Initializes a new Plane object
   *
   * @param {number} width The width of the plane
   * @param {number} height The height of the plane
   * @param {number} [color = 0x000] The color of the plane
   */
  constructor(width, height, color = 0x000) {
    const geometry = new PlaneGeometry(width, height)
    const material = new MeshBasicMaterial({ color: color, side: DoubleSide })
    super(geometry, material)
  }
}
