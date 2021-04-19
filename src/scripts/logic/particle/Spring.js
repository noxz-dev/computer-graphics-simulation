/**
 * Class representing a spring in the particle system.
 * Stores the indexes of the particle it connects.
 * As well as its physical properties.
 */
export default class Spring {
  /**
   * Initializes a new spring object
   *
   * @param {number} from The index of the start particle
   * @param {number} to The index of the end particle
   * @param {number} springConstant The spring constant
   * @param {number} restlength The rest length of the spring
   * @param {number} type The type of the spring 1 = structual, 2 = shear, 3 = flex
   */
  constructor(from, to, springConstant, restlength, type) {
    this._from = from
    this._to = to
    this._springConstant = springConstant
    this._restlength = restlength
    this._type = type
  }

  /**
   * @returns {number} The index of the from particle
   */
  get from() {
    return this._from
  }

  /**
   * @returns {number} The index of the to particle
   */
  get to() {
    return this._to
  }

  /**
   * @returns {number} The index of the from particle
   */
  get springConstant() {
    return this._springConstant
  }

  /**
   * @returns {number} The rest length of the spring
   */
  get restlength() {
    return this._restlength
  }

  /**
   * @returns {number} The type of the spring
   */
  get type() {
    return this._type
  }

  /**
   * @param {number} from The new from index
   */
  set from(from) {
    this._from = from
  }

  /**
   * @param {number} to The new to index
   */
  set to(to) {
    this._to = to
  }

  /**
   * @param {number} springConstant The new spring constant
   */
  set springConstant(springConstant) {
    this._springConstant = springConstant
  }
}
