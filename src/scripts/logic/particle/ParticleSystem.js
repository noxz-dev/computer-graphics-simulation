import { Vector3 } from 'three'

import Particle from './Particle'
import Spring from './Spring'
import ParticleSystemState from './ParticleSystemState'
import {
  ADAPTIVE_STEPSIZE,
  DEFAULT_INTEGRATOR,
  MASS,
  PARTICLE_AMOUNT,
  PARTICLE_DISTANCE,
  PARTICLE_STEP,
  SPRING_CONSTANT,
  DEFAULT_THRESHOLD
} from '../../config'

export default class ParticleSystem {
  /**
   * Initializes a new ParticleSystem
   *
   * @param {number} [stepSize = PARTICLE_STEP]
   * @param {boolean} [checkCollision = true] Toggles the collision property
   * @param {boolean} [fixLeftCorner = true] Toggles the fixLeftCorner property
   * @param {boolean} [fixRightCorner = true] Toggles the fixRightCorner property
   */
  constructor(stepSize = PARTICLE_STEP, checkCollision = true, fixLeftCorner = true, fixRightCorner = true) {
    this._springs = []

    this._checkCollision = checkCollision
    this._fixLeftCorner = fixLeftCorner
    this._fixRightCorner = fixRightCorner

    this._stepSize = stepSize

    this._adaptiveStepsize = ADAPTIVE_STEPSIZE
    this._integrator = DEFAULT_INTEGRATOR
    this._errorThreshold = DEFAULT_THRESHOLD

    // Spring constants
    this._structualConstant = SPRING_CONSTANT
    this._shearConstant = SPRING_CONSTANT
    this._flexConstant = SPRING_CONSTANT

    // Particle options
    this._particles = []
    this._size = PARTICLE_AMOUNT
    this._particleDistance = PARTICLE_DISTANCE
    this._mass = MASS

    for (let i = 0; i < this._size; i++) {
      for (let j = 0; j < this._size; j++) {
        this._particles.push(
          new Particle(
            this._mass,
            new Vector3(
              (-this._size * this._particleDistance) / 2 + j * this._particleDistance,
              (this._size * this._particleDistance) / 2 + this._particleDistance * i,
              0
            ),
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            false
          )
        )
      }
    }

    this._particles[this._size * this._size - this._size].fixed = this._fixLeftCorner
    this._particles[this._size * this._size - 1].fixed = this._fixRightCorner

    this._createStructualSprings()
    this._createShearSprings()
    this._createFlexSprings()

    this._state = new ParticleSystemState(this._particles, this._springs)
  }

  /**
   * Simulates the cloth based on a given time-delta
   *
   * @param delta {number} time-delta
   */
  simulate(delta) {
    if (this._adaptiveStepsize) {
      let firstStep = this._state.copy()
      let secondStep = this._state.copy()

      this.solver(delta, firstStep, firstStep.calculateDerivation, 1)

      this.solver(delta / 2, secondStep, secondStep.calculateDerivation, 1)
      this.solver(delta / 2, secondStep, secondStep.calculateDerivation, 1)

      let err = this.stateDistance(firstStep, secondStep)
      this._h = delta * Math.pow(this._errorThreshold / err, 1 / this._integrator.error)
      this._adaptSize = delta / this._h < 1.0 ? 1.0 : Math.round(delta / this._h)
    } else {
      this._h = delta / this._stepSize
    }

    for (let t = 0.0; t < delta; t += this._h) {
      this.solver(this._h, this._state, this._state.calculateDerivation, this._integrator.index)
    }
  }

  /**
   * Calculates the new state of the particle
   *
   * @param {number} h stepSize
   * @param {ParticleSystemState} state current particleSystemState
   * @param {Function} func integrator function
   * @param {number} method solver method
   **/
  solver(h, state, func, method) {
    switch (method) {
      case 1: {
        let k1 = func(state, h)
        let k2 = func(state.addDerivation(k1.multiplyScalar(1 / 2)), h)
        let k3 = func(state.addDerivation(k2.multiplyScalar(1 / 2)), h)
        let k4 = func(state.addDerivation(k3.multiplyScalar(1)), h)

        state.applyDerivation(
          k1
            .multiplyScalar(1 / 3)
            .add(k2.multiplyScalar(2 / 3))
            .add(k3.multiplyScalar(1 / 3))
            .add(k4.multiplyScalar(1 / 6))
        )
        break
      }
      case 2: {
        let k1 = func(state, h)
        state.applyDerivation(k1)
        break
      }
    }
  }

  /**
   * Calculates the distance between two states
   *
   * @param {ParticleSystemState} firstState First state
   * @param {ParticleSystemState} secondState Second state
   */
  stateDistance(firstState, secondState) {
    let sum = 0
    for (let i = 0; i < firstState.particles.length; i++) {
      let pos = firstState.particles[i].position.clone().sub(secondState.particles[i].position)
      sum += pos.x * pos.x + pos.y * pos.y + pos.z * pos.z

      let vel = firstState.particles[i].velocity.clone().sub(secondState.particles[i].velocity)
      sum += vel.x * vel.x + vel.y * vel.y + vel.z * vel.z
    }
    return Math.sqrt(sum)
  }

  /**
   * Generates structual springs
   */
  _createStructualSprings() {
    // vertical springs
    for (let i = 0; i < this._size; i++) {
      for (let j = 0; j < this._size - 1; j++) {
        this._springs.push(
          new Spring(j + this._size * i, j + 1 + this._size * i, this._structualConstant, this._particleDistance, 1)
        )
      }
    }

    // horizontal springs
    for (let i = 0; i < this._size - 1; i++) {
      for (let j = 0; j < this._size; j++) {
        this._springs.push(
          new Spring(j + this._size * i, j + this._size * (i + 1), this._structualConstant, this._particleDistance, 1)
        )
      }
    }
  }

  /**
   * Generates shear springs
   */
  _createShearSprings() {
    let quat = this._particleDistance * this._particleDistance
    let distance = Math.sqrt(quat + quat)
    for (let i = 0; i < this._size - 1; i++) {
      for (let j = 0; j < this._size - 1; j++) {
        this._springs.push(
          new Spring(j + this._size * i, j + 1 + this._size * (i + 1), this._shearConstant, distance, 2)
        )
      }
    }

    for (let i = 0; i < this._size - 1; i++) {
      for (let j = 0; j < this._size - 1; j++) {
        this._springs.push(
          new Spring(j + this._size * (i + 1), j + 1 + this._size * i, this._shearConstant, distance, 2)
        )
      }
    }
  }

  /**
   * Generates flex springs
   */
  _createFlexSprings() {
    for (let i = 0; i < this._size; i++) {
      for (let j = 0; j < this._size - 2; j++) {
        this._springs.push(
          new Spring(j + this._size * i, j + 2 + this._size * i, this._flexConstant, this._particleDistance * 2, 3)
        )
      }
    }

    for (let i = 0; i < this._size - 2; i++) {
      for (let j = 0; j < this._size; j++) {
        this._springs.push(
          new Spring(j + this._size * i, j + this._size * (i + 2), this._flexConstant, this._particleDistance * 2, 3)
        )
      }
    }
  }

  /**
   * @returns {number}
   */
  get stepSize() {
    return this._stepSize
  }

  /**
   * @returns {Particle[]}
   */
  get particles() {
    return this._state.particles
  }

  /**
   * @returns {Spring[]}
   */
  get springs() {
    return this._state.springs
  }

  /**
   * @returns {number}
   */
  get h() {
    return this._h
  }

  /**
   * @returns {number}
   */
  get size() {
    return this._size
  }

  /**
   * @returns {number}
   */
  get adaptSize() {
    return this._adaptSize
  }

  /**
   * @param {number} stepSize The new stepSize
   */
  set stepSize(stepSize) {
    this._stepSize = stepSize
  }

  /**
   * @param {boolean} checkCollision Toggles the collision flag
   */
  set checkCollision(checkCollision) {
    this._checkCollision = checkCollision
  }

  /**
   * @param {boolean} fixRightCorner Toggles the right-corner fix property
   */
  set fixRightCorner(fixRightCorner) {
    this._fixRightCorner = fixRightCorner
    this._particles[this._size * this._size - 1].fixed = this._fixRightCorner

    if (this._fixRightCorner === true) {
      this._particles[this._size * this._size - 1].position = new Vector3(
        (-this._size * this._particleDistance) / 2 + this._size * this._particleDistance - this._particleDistance,
        (this._size * this._particleDistance) / 2 + this._size * this._particleDistance - this._particleDistance,
        0
      )
      this._particles[this._size * this._size - 1].velocity = new Vector3(0, 0, 0)
      this._particles[this._size * this._size - 1].force = new Vector3(0, 0, 0)
    }
  }

  /**
   * @param {boolean} fixRightCorner Toggles the left-corner fix property
   */
  set fixLeftCorner(fixLeftCorner) {
    this._fixLeftCorner = fixLeftCorner

    this._particles[this._size * this._size - this._size].fixed = this._fixLeftCorner

    if (this._fixLeftCorner === true) {
      this._particles[this._size * this._size - this._size].position = new Vector3(
        (-this._size * this._particleDistance) / 2,
        (this._size * this._particleDistance) / 2 + this._size * this._particleDistance - this._particleDistance,
        0
      )
      this._particles[this._size * this._size - this._size].velocity = new Vector3(0, 0, 0)
      this._particles[this._size * this._size - this._size].force = new Vector3(0, 0, 0)
    }
  }

  /**
   * @param {number} airConstant The new airConstant
   */
  set airConstant(airConstant) {
    this._airResistance = airConstant
  }

  /**
   * @param {number} mass The new mass of the particle
   */
  set mass(mass) {
    this._mass = mass

    this._particles.forEach((particle) => {
      particle.mass = this._mass
    })
  }

  /**
   * @param {number} structualConstant The new structualConstant
   */
  set structualConstant(structualConstant) {
    this._structualConstant = structualConstant

    this._springs.forEach((spring) => {
      if (spring.type === 1) spring.springConstant = this._structualConstant
    })
  }

  /**
   * @param {number} shearConstant The new shearConstant
   */
  set shearConstant(shearConstant) {
    this._shearConstant = shearConstant
    this._springs.forEach((spring) => {
      if (spring.type === 2) spring.springConstant = this._shearConstant
    })
  }

  /**
   * @param {number} flexConstant The new flexConstant
   */
  set flexConstant(flexConstant) {
    this._flexConstant = flexConstant
    this._springs.forEach((spring) => {
      if (spring.type === 3) spring.springConstant = this._flexConstant
    })
  }

  /**
   * @param {number} gravity The new gravity
   */
  set gravity(gravity) {
    this._state.gravity = gravity
  }

  /**
   * @param {number} airResistance The new airResistance
   */
  set airResistance(airResistance) {
    this._state.airResistance = airResistance
  }

  /**
   * @param {number} timeDelta The new timeDelta
   */
  set timeDelta(timeDelta) {
    this._timeDelta = timeDelta
  }

  /**
   * @param {number} adaptiveStepsize The new adaptiveStepsize
   */
  set adaptiveStepsize(adaptiveStepsize) {
    this._adaptiveStepsize = adaptiveStepsize
  }

  /**
   * @param {number} adaptiveStepsize The new adaptiveStepsize
   */
  set errorThreshold(errorThreshold) {
    this._errorThreshold = errorThreshold
  }

  /**
   * @param {Object} integrator The new integrator
   */
  set integrator(integrator) {
    this._integrator = integrator
  }

  /**
   * @param {number} adaptiveStepsize Toggles the wind
   */
  set enableWind(enable) {
    this._state.enableWind = enable
  }

  /**
   * @param {number} windStrength The new windStrength
   */
  set windStrength(windStrength) {
    this._state.windStrength = windStrength
  }

  /**
   * @param {number} windX The new windX
   */
  set windX(windX) {
    this._state.windX = windX
  }

  /**
   * @param {number} windY The new windY
   */
  set windY(windY) {
    this._state.windY = windY
  }

  /**
   * @param {number} windZ The new windZ
   */
  set windZ(windZ) {
    this._state.windZ = windZ
  }
}
