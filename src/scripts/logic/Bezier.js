import { Vector3 } from 'three'

import { BEZIER_STEP_SIZE } from '../config'
/**
 * Implementation of a cubic bezier curve
 * The bernstein polynomials are user for calculating the curve.
 */
export default class Bezier {
  /**
   * Initializes a new bezier object
   */
  constructor() {
    this._controlPoints = []
    this._factors = []
    this._stepSize = BEZIER_STEP_SIZE
  }

  /**
   * Calculates the cubic bezier curve using bernstein polynomial
   *
   * @returns {Vector3[]} The calculated bezierpoints
   */
  calculateCubicBezier() {
    let points = []
    this._factors = []
    for (let t = 0.0; t <= 1.0; t += this._stepSize) {
      let firstFactor = this._calculateBernsteinPolynomial(1 - t, 3)
      let secondFactor = this._calculateBernsteinPolynomial(1 - t, 2, 3 * t)
      let thirdFactor = this._calculateBernsteinPolynomial(t, 2, 3, 1 - t)
      let fourthFactor = this._calculateBernsteinPolynomial(t, 3)

      let sum = this._applyFactor(this._controlPoints[0].position, firstFactor)
        .add(this._applyFactor(this._controlPoints[1].position, secondFactor))
        .add(this._applyFactor(this._controlPoints[2].position, thirdFactor))
        .add(this._applyFactor(this._controlPoints[3].position, fourthFactor))

      points.push(sum)

      this._factors.push(firstFactor, secondFactor, thirdFactor, fourthFactor)
    }

    return points
  }

  /**
   * Applys the given factor to the given Vector3
   *
   * @param {Vector3} point The point which the factor should be multiplied to
   * @param {number} factor The factor that should be multiplied
   */
  _applyFactor(point, factor) {
    let x = factor * point.x
    let y = factor * point.y
    return new Vector3(x, y, 0)
  }

  /**
   * Calculates the bernstein polynomial for the given parameters
   *
   * @param {number} t The current t step
   * @param {number} k The power of the polynomial
   * @param {number} [factor = 1] The first factor that should be multiplied with
   * @param {number} [secondFactor = 1] The second factor that should be multiplied with
   * @returns {number} The percentage factor of the specific polynom at t
   */
  _calculateBernsteinPolynomial(t, k, factor = 1, secondFactor = 1) {
    return factor * Math.pow(t, k) * secondFactor
  }

  /**
   * Adds a new control point
   *
   * @param {Vector3} point
   */
  addControlPoint(point) {
    this._controlPoints.push(point)
  }

  /**
   * @returns {Vector3[]} The control points
   */
  get controlPoints() {
    return this._controlPoints
  }

  /**
   * @returns {number[]} List with all factors
   */
  get factors() {
    return this._factors
  }

  /**
   * @param {number} stepSize The new stepSize
   */
  set stepSize(stepSize) {
    this._stepSize = stepSize
  }

  /**
   * Clears all control points
   */
  clear() {
    this._controlPoints = []
  }
}
