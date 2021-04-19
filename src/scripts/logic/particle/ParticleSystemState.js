import { Vector3 } from 'three'

import DerivationState from './DerivationState'
import { AIR_RESISTANCE, GRAVITY, ENABLE_WIND, WIND_STRENGTH } from '../../config'

/**
 * Stores a particle system state.
 * Containing all particles, springs and a DerivationState.
 * Forces are also stored inside this class.
 */
export default class ParticleSystemState {
  /**
   * Initializes a new ParticleSystemState
   *
   * @param {Particle[]} particles The particles contained in the system
   * @param {Spring[]} springs The springs contained in the system
   */
  constructor(particles, springs) {
    this._particles = particles
    this._springs = springs
    this._derivationState = new DerivationState()

    this._gravity = GRAVITY
    this._airResistance = AIR_RESISTANCE

    this._enableWind = ENABLE_WIND
    this._windStrength = WIND_STRENGTH
    this._windForce = new Vector3(0, 0, 0)

    this._windX = 0
    this._windY = 0
    this._windZ = 1
  }

  /**
   * Copys the particle system state
   *
   * @returns {ParticleSystemState} A new copied particle system state
   */
  copy() {
    let particles = []
    for (let i = 0; i < this._particles.length; i++) {
      particles.push(this._particles[i].copy())
    }
    return new ParticleSystemState(particles, this._springs)
  }

  /**
   * Calculates the derivation of the given particle system state.
   * Applys all forces and generates the derivations for every particle
   *
   * @param {ParticleSystemState} state The particle system state of which the derivation should be calculated
   * @param {number} h The step size
   * @returns {DerivationState} The resulting derivation state
   */
  calculateDerivation(state, h) {
    for (let i = 0; i < state._particles.length; i++) {
      if (state._particles[i].fixed) continue

      let particle = state._particles[i]

      particle.force = new Vector3(0.0, 0.0, 0.0)
      let force = state._gravity * particle.mass
      particle.force.add(new Vector3(0.0, force, 0.0))

      let len = particle.velocity.length()
      len *= len

      let air = particle.velocity
        .clone()
        .normalize()
        .multiplyScalar(-state._airResistance * len)
      particle.force.add(air)

      if (state._enableWind) {
        // console.log('enabled')
        state._windForce.set(state._windX, state._windY, state._windZ)
        state._windForce.normalize()
        state._windForce.multiplyScalar(state._windStrength)
        particle.force.add(state._windForce)
      }
    }

    for (let i = 0; i < state._springs.length; i++) {
      let spring = state._springs[i]

      let particleFrom = spring.from
      let particleTo = spring.to
      let difference = state._particles[particleFrom].position.clone().sub(state._particles[particleTo].position)
      let len = difference.length()
      let baseForce = -spring.springConstant * (len - spring.restlength)

      let force = difference.normalize().multiplyScalar(baseForce)

      if (!state._particles[particleFrom].fixed) {
        state._particles[particleFrom].force.add(force)
      }
      if (!state._particles[particleTo].fixed) {
        state._particles[particleTo].force.sub(force)
      }
    }

    state._derivationState.calculateDerivation(state._particles, h)
    return state._derivationState
  }

  /**
   * Adds the given derivation state an returns a copy of the resulting
   *
   * @param {DerivationState} derivationState The derivation state that should be added
   * @returns {DerivationState} The resulting derivation state
   */
  addDerivation(derivationState) {
    let newState = this.copy()
    for (let i = 0; i < this._particles.length; i++) {
      newState._particles[i].position.add(derivationState.dpdts[i])
      newState._particles[i].velocity.add(derivationState.dvdts[i])
    }
    return newState
  }

  /**
   * Applys the given derivation state
   *
   * @param {DerivationState} derivationState
   * @returns {this} The updated derivation state
   */
  applyDerivation(derivationState) {
    for (let i = 0; i < this._particles.length; i++) {
      if (this._particles[i].position.y + derivationState.dpdts[i].y < 0) {
        derivationState.dpdts[i].y = 0
        derivationState.dvdts[i].y = 0
      }
      this._particles[i].position.add(derivationState.dpdts[i])
      this._particles[i].velocity.add(derivationState.dvdts[i])
    }
    return this
  }

  /**
   * @returns {Partiicle[]} All particles in the state
   */
  get particles() {
    return this._particles
  }

  /**
   * @returns {Particle[]} All particles in the state
   */
  get springs() {
    return this._springs
  }

  /**
   * @param {number} gravity The new gravity
   */
  set gravity(gravity) {
    this._gravity = gravity
  }

  /**
   * @param {number} airResistance The new air resistance
   */
  set airResistance(airResistance) {
    this._airResistance = airResistance
  }

  /**
   * @param {boolean} enable Toggles the activation of the wind force
   */
  set enableWind(enable) {
    this._enableWind = enable
  }

  /**
   * @param {number} strength The new wind strength
   */
  set windStrength(strength) {
    this._windStrength = strength
  }

  /**
   * @param {number} windX The wind x-direction
   */
  set windX(windX) {
    this._windX = windX
  }

  /**
   * @param {number} windY The wind y-direction
   */
  set windY(windY) {
    this._windY = windY
  }

  /**
   * @param {number} windX The wind x-direction
   */
  set windZ(windZ) {
    this._windZ = windZ
  }
}
