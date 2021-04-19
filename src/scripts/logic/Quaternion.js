import { Matrix4 } from 'three'

import Utils from '../utils/utils'
/**
 * Implementation of a quaternion
 */
export default class Quaternion {
  /**
   * Initializes a new quaternion object
   *
   * @param {number} s The rotation in degrees
   * @param {Vector3} vector The rotation axis
   */
  constructor(s, vector) {
    this._s = s
    this._v = vector

    return this
  }

  /**
   * Creates a copy of the quaternion
   */
  copy() {
    return new Quaternion(this._s, this._v.clone())
  }

  /**
   * Adds the given quaternion
   *
   * @param {Quaternion} quaternion The quaterionen that should be added
   * @returns {Quaternion} A new quaternionen with the sum of the two quaternions
   */
  add(quaternion) {
    let scalar = this._s + quaternion._s
    let imaginary = this._v.add(quaternion._v)

    return new Quaternion(scalar, imaginary)
  }

  /**
   * Subtracts the given quaternion
   *
   * @param {Quaternion} quaternion The quaternion that should be subtracted
   * @returns {Quaternion} A new quaternion with the difference of the two quaternions
   */
  subtract(quaternion) {
    let scalar = this._s - quaternion._s
    let imaginary = this._v.sub(quaternion._v)

    return new Quaternion(scalar, imaginary)
  }

  /**
   * Multiplies the given quaternion
   *
   * @param {Quaternion} quaternion The quaternion that should be multiplied
   * @returns {Quaternion} A new quaternion with the product of the two quaternions
   */
  multiply(quaternion) {
    let scalar = this._s * quaternion._s + this._v.dot(quaternion._v)
    let imaginary = this._v
      .multiplyScalar(quaternion._s)
      .add(this._v.multiplyScalar(quaternion._s).add(this._v.cross(quaternion._v)))

    return new Quaternion(scalar, imaginary)
  }

  /**
   * Multiplies a scalar to the quaternion
   *
   * @param {number} scalar The scalar that should be multiplied with
   * @returns {Quaternion} The current quaternion with the multiplied scalar
   */
  multiplyScalar(scalar) {
    this._s *= scalar
    this._v = this._v.multiplyScalar(scalar)

    return this
  }

  /**
   * Calculates the norm of the quaternion
   *
   * @returns {number} The resulting norm
   */
  norm() {
    let scalar = this._s * this._s
    let imaginary = this._v.dot(this._v)

    return Math.sqrt(scalar + imaginary)
  }

  /**
   * Normalizes the quaternion
   *
   * @returns {Quaternion} The normalized quaternion
   */
  normalize() {
    if (this.norm() !== 0) {
      let normValue = 1 / this.norm()

      this._s *= normValue
      this._v = this._v.multiplyScalar(normValue)
    }

    return this
  }

  /**
   * Conjugates the quaternion
   *
   * @returns {Quaternion} A new quaternion with the conjugate of this
   */
  conjugate() {
    let scalar = this._s
    let imaginary = this._v.multiplyScalar(-1)
    return new Quaternion(scalar, imaginary)
  }

  /**
   * Negates the quaternion
   */
  negate() {
    this._s = -this._s
    this._v.multiplyScalar(-1)
  }

  /**
   * Inverses the quaternion
   *
   * @returns {Quaternion} A new quaternion with the inverse of the
   */
  inverse() {
    let norm = this.norm()
    norm *= norm
    norm = 1 / norm

    let conjugateQuaternion = this.conjugate()

    let scalar = conjugateQuaternion._s * norm
    let imaginary = conjugateQuaternion._v.multiplyScalar(norm)

    return new Quaternion(scalar, imaginary)
  }

  /**
   * Calculates the dot product
   *
   * @param {Quaternion} quaternion The second quaternion for the dot product
   *
   * @returns {number} The result of the dot product
   */
  dot(quaternion) {
    return this._s * quaternion._s + this._v.dot(quaternion._v)
  }

  /**
   * Interpolates between this and the given quaternion at the given t using slerp
   *
   * @param {Quaternion} quaternion The second quaternion for interpolation
   * @param {number} t The time t of the interpolation
   * @returns {Quaternion} The interpolated quaternion
   */
  slerp(quaternion, t) {
    let temp = this

    temp.normalize()
    quaternion.normalize()

    let dot = this.dot(quaternion)

    if (dot > 0.9995) {
      let result = temp.add(quaternion.subtract(temp).multiplyScalar(t))
      return result.normalize()
    }

    let theta_0 = Math.acos(dot)
    let theta = theta_0 * t
    let sin_theta = Math.sin(theta)
    let sin_theta_0 = Math.sin(theta_0)
    let s0 = Math.cos(theta) - (dot * sin_theta) / sin_theta_0
    let s1 = sin_theta / sin_theta_0

    return temp
      .multiplyScalar(s0)
      .add(quaternion.multiplyScalar(s1))
      .normalize()
  }

  /**
   * Converts the quaternion to a homogeneous rotation matrix
   *
   * @returns {Matrix4} The resulting homogeneous rotation matrix
   */
  getRotationMatrix() {
    let x = this._v.x
    let y = this._v.y
    let z = this._v.z
    let s = this._s

    let matrix = new Matrix4()

    matrix.set(
      1 - 2 * (y * y + z * z),
      2 * (x * y - s * z),
      2 * (x * z + s * y),
      0,
      2 * (x * y + s * z),
      1 - 2 * (x * x + z * z),
      2 * (y * z - s * x),
      0,
      2 * (x * z - s * y),
      2 * (y * z + s * x),
      1 - 2 * (x * x + y * y),
      0,
      0,
      0,
      0,
      1
    )

    return matrix
  }

  /**
   * Converts the quaternion to a unit norm quaternion
   *
   * @returns {Quaternion} The unit norm quaternion
   */
  unitNormQuaternion() {
    let angle = Utils.toRadians(this._s) / 2
    this._v.normalize()

    this._s = Math.cos(angle)
    this._v = this._v.multiplyScalar(Math.sin(angle))

    return this
  }

  /**
   * @param {number} newS The new degree value
   */
  set s(newS) {
    this._s = newS
  }

  /**
   * @returns {number} The rotation angle
   */
  get s() {
    return this._s
  }

  /**
   * @returns {Vector3} The rotation axis
   */
  get vector() {
    return this._v
  }
}
