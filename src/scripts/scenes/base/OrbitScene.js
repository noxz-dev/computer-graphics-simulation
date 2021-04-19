import { PerspectiveCamera, HemisphereLight, SpotLight, Color, Vector3, AxesHelper } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Sky } from 'three/examples/jsm/objects/Sky'

import BasicScene from './BasicScene'

/**
 * Wrapper-Class implementing orbit controls
 */
export default class OrbitScene extends BasicScene {
  /**
   * Initialises a new OrbitScene
   *
   * @param {number} width The width of the scene
   * @param {number} height The height of the scene
   * @param {HTMLCanvasElement} canvas The canvas on which the scene should be rendered
   */
  constructor(width, height, canvas) {
    super(width, height, canvas)

    this.controls = null
    this._createSky()
    this._createCamera()
    this._createObitcontrols()
    this._createLights()

    this._options = {
      'Show Axeshelper': false
    }

    this._axesHelper = new AxesHelper(500)

    this.gui.add(this._options, 'Show Axeshelper').onChange((value) => {
      if (value === true) {
        this.addObject(this._axesHelper)
      } else {
        this.removeObject(this._axesHelper)
      }
    })
  }

  /**
   * Main animation loop
   *
   * @param {Function} callback The function that is called every frame
   */
  animate(callback) {
    super.animate(() => callback())
  }

  /**
   * Creates a sky objects and adds it to the scene
   */
  _createSky() {
    const sky = new Sky()
    sky.scale.setScalar(450000)
    this.addObject(sky)
    this.scene.background = new Color('#f7edff')
    const sun = new Vector3()

    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.25, // Facing front,
      exposure: this.renderer.toneMappingExposure
    }

    const uniforms = sky.material.uniforms
    uniforms['turbidity'].value = effectController.turbidity
    uniforms['rayleigh'].value = effectController.rayleigh
    uniforms['mieCoefficient'].value = effectController.mieCoefficient
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG

    const theta = Math.PI * (effectController.inclination - 0.5)
    const phi = 2 * Math.PI * (effectController.azimuth - 0.5)

    sun.x = Math.cos(phi)
    sun.y = Math.sin(phi) * Math.sin(theta)
    sun.z = Math.sin(phi) * Math.cos(theta)

    uniforms['sunPosition'].value.copy(sun)

    this.renderer.toneMappingExposure = effectController.exposure
  }

  /**
   * Creates the light in the scene
   */
  _createLights() {
    const skyColor = '#fffee0'
    const groundColor = 'burlywood' // Blasses Orange
    const intensity = 0.5
    const ambient = new HemisphereLight(skyColor, groundColor, intensity)
    this.addObject(ambient)

    const spotLight = new SpotLight(0xcccccc)
    spotLight.position.set(100, 500, 300)
    spotLight.castShadow = true
    this.addObject(spotLight)

    const spotLight2 = new SpotLight(0xcccccc)
    spotLight2.position.set(100, 100, -300)
    spotLight2.castShadow = true

    this.addObject(spotLight2)
  }

  /**
   * Initializes the camera
   */
  _createCamera() {
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000)
    this.camera.up.set(0, 1, 0)
    this.camera.position.set(-200, 150, 50)
    this.camera.lookAt(0, 600, 0)
  }

  /**
   * Initializes the orbit controls
   */
  _createObitcontrols() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enablePan = true
    this.controls.rotateSpeed = 0.8
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.2
    this.controls.target.set(0, 5, 0)
    this.controls.enableZoom = true
    this.controls.update()
  }
}
