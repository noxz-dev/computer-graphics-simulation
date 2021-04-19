/**
 * Class representing a Particle with attributes for physical calculations
 */
export default class Particle {
  /**
   * Intializes a new Particle object
   *
   * @param {number} mass The mass of the particle
   * @param {Vector3} position The position of the particle
   * @param {Vector3} velocity The velocity of the particle
   * @param {Vector3} force The force of the particle
   * @param {boolean} [fixed = false] If the particle is fixed
   */
  constructor(mass, position, velocity, force, fixed = false) {
    this._m = mass
    this._p = position
    this._v = velocity
    this._f = force
    this._fixed = fixed
  }

  /**
   * Makes a copy of the particle
   * @returns {Particle} a copy of the particle
   */
  copy() {
    return new Particle(this._m, this._p.clone(), this._v.clone(), this._f.clone(), this._fixed)
  }

  /**
   * @returns {number}
   */
  get mass() {
    return this._m
  }

  /**
   * @param {number} mass The new mass
   */
  set mass(mass) {
    this._m = mass
  }

  /**
   * @returns {Vector3}
   */
  get position() {
    return this._p
  }

  /**
   * @param {Vector3} position The new position
   */
  set position(position) {
    this._p = position
  }

  /**
   * @return {Vector3}
   */
  get force() {
    return this._f
  }

  /**
   * @param {Vector3} force The new force
   */
  set force(force) {
    this._f = force
  }
  /**
   * @return {Vector3}
   */
  get velocity() {
    return this._v
  }

  /**
   * @param {Vector3} velocity The new velocity
   */
  set velocity(velocity) {
    this._v = velocity
  }

  /**
   * @return {boolean}
   */
  get fixed() {
    return this._fixed
  }

  /**
   * @param {boolean} fixed The new fixed boolean
   */
  set fixed(fixed) {
    this._fixed = fixed
  }
}
