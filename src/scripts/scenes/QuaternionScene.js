import { Vector3 } from 'three'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { MtlObjBridge } from 'three/examples/jsm/loaders/obj2/bridge/MtlObjBridge'

import OrbitScene from './base/OrbitScene'
import Sphere from '../logic/wrapper/Sphere'
import Quaternion from '../logic/Quaternion'
import Utils from '../utils/utils'
import { Color } from '../utils/color'

/**
 * Scene which visualizes the quaternion functionalities
 */
export default class QuaternionScene extends OrbitScene {
  /**
   * Initializess an new quaternion scene
   *
   * @param {number} width The width of the scene
   * @param {number} height The height of the scene
   * @param {HTMLCanvasElement} canvas The canvas on which the scene should be rendered
   */
  constructor(width, height, canvas) {
    super(width, height, canvas)

    this.rotation = undefined
    this.gui.remove(this.gui.__controllers[0])
    this._createUnitSphere()

    this.currentQuaternion = null
    this.currentSphere = null
    this.interpolationPoints = []
    this.interpolationSpheres = []
    this.interpolationLine = null
    this.quaternions = []
    this.quaternionSpheres = []

    this.folders = []
    this.finished = false

    this.quatFolders = []
    const mtlLoader = new MTLLoader()
    mtlLoader.load('/models/windmill/low-poly-mill.mtl', (mtlParseResult) => {
      const objLoader = new OBJLoader2()
      const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult)
      objLoader.addMaterials(materials)
      objLoader.load('/models/windmill/low-poly-mill.obj', (root) => {
        this.cube = root
        let cubeQuat = new Quaternion(0, this.cube.position)
        cubeQuat.unitNormQuaternion()
        this.quaternions.push(cubeQuat)
        this._addQuaternion()
        this.currentQuaternion = this.quaternions[1]
        this.currentSphere = new Sphere(8, 32, 32, false, 1.0, 0xff0000)
        this.currentSphere.updatePosition(this.currentQuaternion.vector.normalize())
        this.addObject(this.currentSphere)
        this.addObject(this.cube)
      })
    })

    this.animationRunning = false
    this.quatSettings = {
      clear: () => this._resetScene(),
      t: 0.001,
      PlayRotation: async () => {
        if (this.quaternions.length !== 0 && !this.animationRunning) {
          this._clearObjects()
          this.animationRunning = true
          for (let i = 0; i <= 1.1; i += 0.001) {
            this.gui.__controllers[2].setValue(i)
            await Utils.sleep(1)
          }
          this.animationRunning = false
        }
      },
      'Neues Quaternion': () => {
        this._addQuaternion()
      }
    }
    this.gui.add(this.quatSettings, 'clear')
    let slider = this.gui.add(this.quatSettings, 't', 0.001, 1)

    slider.onChange(() => {
      if (this.quatSettings.t === 1.0) this.finished = true
      this._rotateObject()
    })
    this.gui.add(this.quatSettings, 'PlayRotation')
    this.gui.add(this.quatSettings, 'Neues Quaternion')
  }

  /**
   * Rotates the object with the given quaternion chain.
   * Slerp is used for interpolation.
   */
  _rotateObject() {
    let index = Math.ceil((this.quaternions.length - 1) * this.quatSettings.t) - 1
    let q1 = this.quaternions[index].copy()
    let q2 = this.quaternions[index + 1].copy()

    let t = -index + this.quatSettings.t * (this.quaternions.length - 1)
    let rotation = q1.slerp(q2, t)
    this.currentQuaternion = rotation.copy()
    let vec = rotation.vector
      .clone()
      .normalize()
      .multiplyScalar(100)

    this.currentSphere.updatePosition(vec)

    if (!this.finished) {
      let sphere = new Sphere(1, 10, 10, false, 1.0)
      sphere.setHSLColor(0.75 * this.quatSettings.t)
      sphere.updatePosition(vec)
      this.addObject(sphere)
      this.interpolationSpheres.push(sphere)
    }

    this.interpolationPoints.push(vec)
    this.cube.rotation.setFromRotationMatrix(this.currentQuaternion.getRotationMatrix())
  }

  /**
   * Called every frame
   */
  animate() {
    super.animate(() => {})
  }

  _createUnitSphere() {
    let sphere = new Sphere(100, 32, 32, true, 0.3, 0x9ce9ff)
    this.addObject(sphere)
  }

  /**
   * Clears all objects from the scene
   */
  _clearObjects() {
    this.interpolationSpheres.forEach((sphere) => {
      this.removeObject(sphere)
    })
    this.finished = false
    this.interpolationSpheres = []
  }

  /**
   * Adds a new quaternion to the rotation chain.
   * Creates GUI element for manipulating it
   */
  _addQuaternion() {
    const quat = {
      s: 180,
      x: 1,
      y: 0,
      z: 0,
      index: this.quaternions.length
    }
    let quaternion = new Quaternion(quat.s, new Vector3(quat.x, quat.y, quat.z))
    quaternion.unitNormQuaternion()

    this.quaternions.push(quaternion)
    this.quatFolders.push(quat)

    let color = Color.random()
    const folder = this.gui.addFolder(color)
    this.quaternionSpheres.push(this._createQuaternionSphere(quaternion, color))

    folder.add(this.quatFolders[this.quatFolders.length - 1], 's', 0, 360).onChange((newVal) => {
      let quaternion = this.quaternions[quat.index]
      quaternion.s = newVal
      quaternion.unitNormQuaternion()
    })
    folder.add(this.quatFolders[this.quatFolders.length - 1], 'x', -1, 1, 0.001).onChange((newVal) => {
      let quaternion = this.quaternions[quat.index]
      quaternion.vector.x = newVal
      this.quaternionSpheres[quat.index - 1].updatePosition(
        quaternion.vector
          .clone()
          .normalize()
          .multiplyScalar(100)
      )
    })
    folder.add(this.quatFolders[this.quatFolders.length - 1], 'y', -1, 1, 0.001).onChange((newVal) => {
      let quaternion = this.quaternions[quat.index]
      quaternion.vector.y = newVal
      this.quaternionSpheres[quat.index - 1].updatePosition(
        quaternion.vector
          .clone()
          .normalize()
          .multiplyScalar(100)
      )
    })
    folder.add(this.quatFolders[this.quatFolders.length - 1], 'z', -1, 1, 0.001).onChange((newVal) => {
      let quaternion = this.quaternions[quat.index]
      quaternion.vector.z = newVal
      this.quaternionSpheres[quat.index - 1].updatePosition(
        quaternion.vector
          .clone()
          .normalize()
          .multiplyScalar(100)
      )
    })

    this.folders.push(folder)
  }

  /**
   * Creates a new sphere object representing the quaternion
   *
   * @param {Quaternion} quaternion The quaternion from which the sphere should be created
   * @param {string} color The color of the sphere
   * @returns {Object3D} The created sphere object
   */
  _createQuaternionSphere(quaternion, color) {
    let temp = new Sphere(5, 32, 32, false, 1.0, Color.names[color])
    this.addObject(temp)
    let quat = quaternion.copy()
    let vec = quat.vector
    vec.normalize()
    temp.updatePosition(vec.multiplyScalar(100))
    this.addObject(temp)
    return temp
  }

  /**
   * Resets the scene
   */
  _resetScene() {
    this._clearObjects()
    for (let i = 0; i < this.folders.length; i++) {
      this.gui.removeFolder(this.folders[i])
    }
    this.folders = []
    this.quaternions = []
    this.quatFolders = []

    this.quaternionSpheres.forEach((sphere) => {
      this.removeObject(sphere)
    })

    this.quaternionSpheres = []

    let cubeQuat = new Quaternion(0, this.cube.position)
    cubeQuat.unitNormQuaternion()
    this.quaternions.push(cubeQuat)
    this._addQuaternion()
    this.removeObject(this.currentSphere)
    this.currentQuaternion = this.quaternions[1]
    this.currentSphere = new Sphere(8, 32, 32, false, 1.0, 0xff0000)

    this.currentSphere.updatePosition(this.currentQuaternion.vector.normalize())
    this.addObject(this.currentSphere)
    this.addObject(this.cube)
  }
}
