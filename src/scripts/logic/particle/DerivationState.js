/**
 * Stores all derivations of the position and velocity of the particle system
 */
export default class DerivationState {
  /**
   * Initializes a new Derivationstate
   */
  constructor() {
    this._dpdts = []
    this._dvdts = []
  }

  /**
   * Calculates the derivation for every given particle and stores them
   *
   * @param {Particle[]} particles All particles from which the derivations should be calculated
   * @param {number} h The stepsize
   * @returns {this} The updated derivation state
   */
  calculateDerivation(particles, h) {
    this._dpdts = []
    this._dvdts = []
    for (let i = 0; i < particles.length; i++) {
      this._dpdts.push(particles[i].velocity.clone().multiplyScalar(h))
      this._dvdts.push(particles[i].force.clone().multiplyScalar((1 / particles[i].mass) * h))
    }
    return this
  }

  /**
   * Mutiplies a scalar to every position and verlocity derivation
   *
   * @param {number} scalar The scalar that should be multiplied with
   * @returns {this} The updated derivation state
   */
  multiplyScalar(scalar) {
    for (let i = 0; i < this._dpdts.length; i++) {
      this._dpdts[i].multiplyScalar(scalar)
      this._dvdts[i].multiplyScalar(scalar)
    }
    return this
  }

  /**
   * Adds the given derivation state.
   *
   * @param {DerivationState} derivationState The derivation state that should be added
   * @returns {this} The updated derivation state
   */
  add(derivationState) {
    for (let i = 0; i < this._dpdts.length; i++) {
      this._dpdts[i].add(derivationState._dpdts[i])
      this._dvdts[i].add(derivationState._dvdts[i])
    }
    return this
  }

  /**
   * @returns {number[]} All position derivations
   */
  get dpdts() {
    return this._dpdts
  }

  /**
   * @returns {number[]} All velocity derivations
   */
  get dvdts() {
    return this._dvdts
  }
}
