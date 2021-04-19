import Stats from 'three/examples/jsm/libs/stats.module'
import * as dat from 'three/examples/jsm/libs/dat.gui.module'
import { Scene, WebGLRenderer, OrthographicCamera } from 'three'

/**
 * Class representing a scene with basic configuration
 */
export default class BasicScene {
  /**
   * @param {number} width The width of the scene
   * @param {number} height The height of the scene
   * @param {HTMLCanvasElement} canvas The canvas on which the scene should be rendered
   */
  constructor(width, height, canvas) {
    this.width = width
    this.height = height

    this._canvas = canvas

    this.gui = new dat.GUI()
    this.stats = new Stats()

    this.scene = new Scene()
    this.camera = new OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 1, 1000)
    this.camera.position.z = 2

    this.renderer = new WebGLRenderer({ canvas: this._canvas })

    this._id = null

    this._init()
  }

  /**
   * Initializes the gui elements
   */
  _init() {
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    let guiFunctions = {
      clear: () => {
        this.scene.clear()
        this.clearScene()
      }
    }

    this.gui.add(guiFunctions, 'clear')
  }

  /**
   * Resizes the renderer to fit the current canvas size
   *
   * @returns {boolean} If resize is needed
   */
  _resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      this.renderer.setSize(width, height, false)
    }
    return needResize
  }

  /**
   * Main animation loop
   *
   * @param {Function} animationCallback The function that is called every frame
   */
  animate(animationCallback) {
    this.stats.begin()
    if (this._resizeRendererToDisplaySize()) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this._id = requestAnimationFrame(this.animate.bind(this))

    animationCallback()

    this.renderer.render(this.scene, this.camera)
    this.stats.end()
  }

  /**
   * Adds an object to the scene
   *
   * @param {Object3D} object The object that should be added to the scene
   */
  addObject(object) {
    this.scene.add(object)
  }

  /**
   * Remoces an object from the scene
   *
   * @param {Object3D} object The object that should be removed from the scene
   */
  removeObject(object) {
    this.scene.remove(object)
  }

  /**
   * Stops the animation loop
   */
  stopAnimation() {
    cancelAnimationFrame(this._id)
  }
}
