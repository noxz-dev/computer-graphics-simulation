import {
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  ShadowMaterial,
  TextureLoader
} from 'three'

import OrbitScene from './base/OrbitScene'
import CustomLine from '../logic/wrapper/CustomLine'
import Sphere from '../logic/wrapper/Sphere'
import ParticleSystem from '../logic/particle/ParticleSystem'
import {
  AIR_RESISTANCE,
  GRAVITY,
  INTEGRATORS,
  MASS,
  PARTICLE_STEP,
  SPRING_CONSTANT,
  MAX_FORCE,
  DEFAULT_THRESHOLD,
  PARTICLE_AMOUNT,
  ENABLE_WIND,
  WIND_STRENGTH,
  TEXTURE,
  NORMAL,
  ROUGHNESS,
  AO,
  DISPLACEMENT,
  BUMP
} from '../config'

/**
 * Class for visualising the ParticleSystem (Cloth)
 */
export default class ParticleScene extends OrbitScene {
  /**
   * Initialises a new ParticleScene
   *
   * @param {number} width The width of the scene
   * @param {number} height The height of the scene
   * @param {HTMLCanvasElement} canvas The canvas on which the scene should be rendered
   */
  constructor(width, height, canvas) {
    super(width, height, canvas)
    this.gui.remove(this.gui.__controllers[0])
    this._particleSystem = new ParticleSystem()
    this._clock = new Clock()
    this._delta = 0
    this._mesh
    this.camera.position.set(0, (PARTICLE_AMOUNT * PARTICLE_AMOUNT) / 2, 300)
    this.camera.lookAt(0, (PARTICLE_AMOUNT * PARTICLE_AMOUNT) / 2, 0)
    this.controls.target.set(0, (PARTICLE_AMOUNT * PARTICLE_AMOUNT) / 2, 0)

    this._particleSpheres = []
    this._springLines = []

    this._particleConfig = {
      collision: true,
      fixLeftCorner: true,
      fixRightCorner: true,
      airResistance: AIR_RESISTANCE,
      gravity: GRAVITY,
      mass: MASS,
      maxForceVisualisation: MAX_FORCE,
      showWireframe: false
    }

    this._integratorOptions = {
      stepSize: PARTICLE_STEP,
      adaptiveStepsize: true,
      adaptiveH: 0,
      integrator: INTEGRATORS.Runge.name,
      maxError: DEFAULT_THRESHOLD
    }

    this._springConfig = {
      Structual: SPRING_CONSTANT,
      Shear: SPRING_CONSTANT,
      Flex: SPRING_CONSTANT
    }

    this._displayConfig = {
      showWireframe: false,
      showForceColor: false,
      showMesh: true
    }

    this._windConfig = {
      enable: ENABLE_WIND,
      strength: WIND_STRENGTH,
      x: 0,
      y: 0,
      z: 1
    }

    this._createDisplayFolder()
    this._createGlobalFolder()
    this._createSpringFolder()
    this._createParticleFolder()
    this._createWindFolder()
    this._generateClothMesh()
  }

  /**
   * Animation callback
   */
  animate() {
    super.animate(() => {
      this._delta = this._clock.getDelta()
      this._particleSystem.simulate(this._delta)

      if (this._displayConfig.showWireframe) {
        this._particleSystem.particles.forEach((particle, index) => {
          this._particleSpheres[index].updatePosition(particle.position)

          let degree =
            0.33 -
            (0 + ((0.33 - 0) / (this._particleConfig.maxForceVisualisation - 0)) * (particle.force.length() - 0.0))
          this._particleSpheres[index].setHSLColor(degree < 0 ? 0 : degree)
        })

        this._particleSystem.springs.forEach((spring, index) => {
          this._springLines[index].updatePosition([
            this._particleSystem.particles[spring.from].position,
            this._particleSystem.particles[spring.to].position
          ])
        })
      }

      this._integratorOptions.adaptiveH = this._particleSystem.adaptSize
      for (let i in this.gui.__folders['Integrator Options'].__controllers) {
        this.gui.__folders['Integrator Options'].__controllers[i].updateDisplay()
      }

      this._updateClothMesh()
    })
  }

  /**
   * Generates the Cloth mesh
   */
  _generateClothMesh() {
    const geometry = new BufferGeometry()

    const indices = []

    const vertices = []
    const normals = []
    const colors = []

    const uv = []

    let particles = this._particleSystem.particles
    let size = this._particleSystem.size

    let index = 0
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let particle = particles[index]
        vertices.push(particle.position.x, particle.position.y, particle.position.z)
        normals.push(0, 0, 1)

        let degree =
          0.33 - (0 + ((0.33 - 0) / (this._particleConfig.maxForceVisualisation - 0)) * (particle.force.length() - 0.0))
        let color = new Color()
        color.setHSL(degree < 0 ? 0 : degree, 1, 0.5)
        colors.push(color.r, color.g, color.b)
        index++
      }
    }

    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - 1; j++) {
        const topLeft = i * size + j
        const bottomLeft = (i + 1) * size + j
        const bottomRight = (i + 1) * size + (j + 1)
        const topRight = i * size + j + 1
        indices.push(topLeft, bottomLeft, bottomRight)
        indices.push(topLeft, bottomRight, topRight)
      }
    }

    const texture = new TextureLoader().load(TEXTURE)

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        uv[2 * (i * size + j) + 0] = j / (size - 1)
        uv[2 * (i * size + j) + 1] = i / (size - 1)
      }
    }
    geometry.setIndex(indices)
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

    const normal = new TextureLoader().load(NORMAL)
    const roughness = new TextureLoader().load(ROUGHNESS)
    const ao = new TextureLoader().load(AO)
    const displacement = new TextureLoader().load(DISPLACEMENT)
    const bump = new TextureLoader().load(BUMP)

    this.material = new MeshStandardMaterial({
      side: DoubleSide,
      map: texture,
      vertexColors: this._displayConfig.showForceColor,
      normalMap: normal,
      roughnessMap: roughness,
      aoMap: ao,
      displacementMap: displacement,
      bumpMap: bump
    })
    this._mesh = new Mesh(geometry, this.material)
    this.shadowMaterial = new ShadowMaterial()
    this.addObject(this._mesh)
  }

  /**
   * Updates the cloth mesh
   */
  _updateClothMesh() {
    const vertices = []
    const normals = []
    const colors = []

    let particles = this._particleSystem.particles
    let size = this._particleSystem.size

    let index = 0
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let particle = particles[index]
        vertices.push(particle.position.x, particle.position.y, particle.position.z)
        normals.push(0, 0, 1)
        let degree =
          0.33 - (0 + ((0.33 - 0) / (this._particleConfig.maxForceVisualisation - 0)) * (particle.force.length() - 0.0))
        let color = new Color()
        color.setHSL(degree < 0 ? 0 : degree, 1, 0.5)
        colors.push(color.r, color.g, color.b)
        index++
      }
    }
    this._mesh.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

    this._mesh.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  }

  /**
   * Creates the particle settings GUI-folder
   */
  _createParticleFolder() {
    this.gui.add(this._particleConfig, 'maxForceVisualisation', 1, 100000)

    this.gui.add(this._particleConfig, 'collision').onChange((value) => {
      this._particleSystem.checkCollision = value
    })

    this.gui.add(this._particleConfig, 'fixLeftCorner').onChange((value) => {
      this._particleSystem.fixLeftCorner = value
    })

    this.gui.add(this._particleConfig, 'fixRightCorner').onChange((value) => {
      this._particleSystem.fixRightCorner = value
    })

    this.gui.add(this._particleConfig, 'airResistance').onChange((value) => {
      this._particleSystem.airResistance = value
    })

    this.gui.add(this._particleConfig, 'gravity').onChange((value) => {
      this._particleSystem.gravity = value
    })

    this.gui.add(this._particleConfig, 'mass', 10, 1000).onChange((value) => {
      this._particleSystem.mass = value
    })
  }

  /**
   * Creates the global settings GUI-folder
   */
  _createGlobalFolder() {
    const globalFolder = this.gui.addFolder('Integrator Options')
    globalFolder.closed = false
    globalFolder.add(this._integratorOptions, 'stepSize', 1, 1000).onChange((value) => {
      this._particleSystem.stepSize = value
    })

    globalFolder.add(this._integratorOptions, 'adaptiveStepsize').onChange((value) => {
      this._particleSystem.adaptiveStepsize = value
    })

    globalFolder.add(this._integratorOptions, 'adaptiveH', 0, 100)

    globalFolder.add(this._integratorOptions, 'maxError', 0.00001, 0.05, 0.00001).onChange((value) => {
      this._particleSystem.errorThreshold = value
    })

    globalFolder
      .add(this._integratorOptions, 'integrator', [INTEGRATORS.Runge.name, INTEGRATORS.Euler.name])
      .onChange((value) => {
        let integ = INTEGRATORS.Runge
        if (value === INTEGRATORS.Euler.name) integ = INTEGRATORS.Euler
        this._particleSystem.integrator = integ
      })
  }

  /**
   * Creates the display setting GUI-Folder
   */
  _createDisplayFolder() {
    const displayConfigFolder = this.gui.addFolder('Display')
    displayConfigFolder.add(this._displayConfig, 'showWireframe').onChange((value) => {
      if (value === true) {
        this._particleSystem.particles.forEach((particle) => {
          let sphere = new Sphere(2, 2, 2, false, 1.0, 0x00ff00 + particle.force.length())
          sphere.updatePosition(particle.position)
          this._particleSpheres.push(sphere)
          this.addObject(sphere)
        })
        this._particleSystem.springs.forEach((spring) => {
          let line = new CustomLine(
            [this._particleSystem.particles[spring.from].position, this._particleSystem.particles[spring.to].position],
            0.003
          )
          this._springLines.push(line)
          this.addObject(line)
        })
      } else {
        this._particleSpheres.forEach((sphere) => {
          this.removeObject(sphere)
        })
        this._particleSpheres = []
        this._springLines.forEach((line) => {
          this.removeObject(line)
        })
        this._springLines = []
      }
    })
    displayConfigFolder.add(this._displayConfig, 'showForceColor').onChange((value) => {
      this._mesh.material.vertexColors = value
      this.material.needsUpdate = true
    })

    displayConfigFolder.add(this._displayConfig, 'showMesh').onChange((value) => {
      this._mesh.visible = value
    })
  }

  /**
   * Creates the spring settings GUI-folder
   */
  _createSpringFolder() {
    let folder = this.gui.addFolder('Spring Constants')
    folder.closed = false
    folder.add(this._springConfig, 'Structual', 1, 100000).onChange((value) => {
      this._particleSystem.structualConstant = value
    })

    folder.add(this._springConfig, 'Shear', 1, 100000).onChange((value) => {
      this._particleSystem.shearConstant = value
    })

    folder.add(this._springConfig, 'Flex', 1, 100000).onChange((value) => {
      this._particleSystem.flexConstant = value
    })
  }

  /**
   * Creates the wind settings GUI-folder
   */
  _createWindFolder() {
    let windFolder = this.gui.addFolder('Wind Settings')
    windFolder.add(this._windConfig, 'enable').onChange((value) => {
      this._particleSystem.enableWind = value
    })

    windFolder.add(this._windConfig, 'strength', -10000, 10000).onChange((value) => {
      this._particleSystem.windStrength = value
    })

    windFolder.add(this._windConfig, 'x', -1, 1, 0.1).onChange((value) => {
      this._particleSystem.windX = value
    })

    windFolder.add(this._windConfig, 'y', -1, 1, 0.1).onChange((value) => {
      this._particleSystem.windY = value
    })

    windFolder.add(this._windConfig, 'z', -1, 1, 0.1).onChange((value) => {
      this._particleSystem.windZ = value
    })
  }
}
