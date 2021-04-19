import { Line, LineBasicMaterial, BufferGeometry } from 'three'

/**
 * Wrapper-Class for creating a CustomLine
 * adds utility functions to the threejs default line
 */
export default class CustomLine extends Line {
  /**
   * Initializes a new CustomLine object
   *
   * @param {number[]} points The points of the line
   * @param {number} [color = 0xffffff] The color of the line object in hexadecimal
   */
  constructor(points, color = 0xffffff) {
    const lineMaterial = new LineBasicMaterial({ color: color })
    const lineGeometry = new BufferGeometry().setFromPoints(points)
    super(lineGeometry, lineMaterial)
  }

  /**
   * Updates the position
   */
  updatePosition(newPoints = []) {
    let attributesPosition = this.geometry.attributes.position

    for (let i = 0; i < newPoints.length; i++) {
      attributesPosition.setX(i, newPoints[i].x)
      attributesPosition.setY(i, newPoints[i].y)
      attributesPosition.setZ(i, newPoints[i].z)
    }

    attributesPosition.needsUpdate = true
  }
}
