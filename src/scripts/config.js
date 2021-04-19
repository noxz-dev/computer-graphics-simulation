/**
 * All starting values for the program
 */
const BEZIER_STEP_SIZE = 0.001

const PARTICLE_STEP = 10

const GRAVITY = -9.81
const AIR_RESISTANCE = 5
const MASS = 100
const SPRING_CONSTANT = 15000

const PARTICLE_DISTANCE = 10
const PARTICLE_AMOUNT = 20

const ADAPTIVE_STEPSIZE = true
const DEFAULT_THRESHOLD = 0.05
const INTEGRATORS = {
  Runge: {
    index: 1,
    name: 'Runge Kutta',
    error: 5
  },
  Euler: {
    index: 2,
    name: 'Euler',
    error: 2
  }
}

const DEFAULT_INTEGRATOR = INTEGRATORS.Runge

const MAX_FORCE = 10000

const BASE_FOLDER = '/textures'
const SPECIFIC_FOLDER = '/pattern/'
const COMBINED = BASE_FOLDER + SPECIFIC_FOLDER
const TEXTURE = COMBINED + 'texture.jpg'
const NORMAL = COMBINED + 'normal.jpg'
const AO = COMBINED + 'ao.jpg'
const DISPLACEMENT = COMBINED + 'displacement.jpg'
const ROUGHNESS = COMBINED + 'roughness.jpg'
const BUMP = COMBINED + 'bump.jpg'

const ENABLE_WIND = false
const WIND_STRENGTH = 400

export {
  BEZIER_STEP_SIZE,
  PARTICLE_STEP,
  GRAVITY,
  AIR_RESISTANCE,
  MASS,
  SPRING_CONSTANT,
  PARTICLE_DISTANCE,
  PARTICLE_AMOUNT,
  ADAPTIVE_STEPSIZE,
  INTEGRATORS,
  DEFAULT_INTEGRATOR,
  DEFAULT_THRESHOLD,
  MAX_FORCE,
  ENABLE_WIND,
  WIND_STRENGTH,
  TEXTURE,
  NORMAL,
  AO,
  DISPLACEMENT,
  ROUGHNESS,
  BUMP
}
