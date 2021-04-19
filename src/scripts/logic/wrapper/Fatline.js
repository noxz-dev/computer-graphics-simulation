import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'

/**
 * Wrapper-Class for creating a Fatline
 * Enables wider lines
 */
export default class Fatline extends Line2 {
  /**
   * Initializes a new Fatline object
   *
   * @param {Vector3} points The points of the line
   * @param {number} [lineWidth = 0.0025] The width of the line
   * @param {number[]} [colors = []] The vertex colors
   */
  constructor(points, lineWidth = 0.0025, colors = []) {
    const geometry = new LineGeometry()
    if (colors.length === 0)
      colors = calculateColors(points.length, 0.5, 0.5, 0.5)
    geometry.setColors(colors)
    geometry.setPositions(converPoints(points))

    const material = new LineMaterial({
      color: 0xffffff,
      linewidth: lineWidth,
      vertexColors: true,
      dashed: true
    })
    super(geometry, material)
  }

  /**
   * Updates the position
   *
   * @param {Vector3[]} points The new points
   */
  updatePosition(points) {
    this.geometry.setPositions(converPoints(points))
  }

  /**
   * Updates the vertex colors
   *
   * @param {number[]} colors The new seperated RGB-values
   */
  updateColor(colors) {
    this.geometry.setColors(colors)
  }
}

/**
 * Seperates the given Vector3-Array by a x, y and z
 *
 * @param {Vector3[]} points The vectors that should be seperated
 * @returns {number[]} The array with the points
 */
function converPoints(points) {
  let positions = new Float32Array(points.length * 3)
  let index = 0
  for (let i = 0; i < points.length; i++) {
    positions[index] = points[i].x
    positions[index + 1] = points[i].y
    positions[index + 2] = points[i].z
    index += 3
  }
  return positions
}

/**
 * Generates array of RGB values by the given amount
 *
 * @param {number} amount The amount of values that should be generated
 * @returns {number[]} The array with the numbers
 */
function calculateColors(amount, r, g, b) {
  let colors = new Float32Array(amount * 3)
  let index = 0
  for (let i = 0; i < amount; i++) {
    colors[index] = r
    colors[index + 1] = g
    colors[index + 2] = b
    index += 3
  }
  return colors
}
