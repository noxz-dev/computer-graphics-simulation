import { Raycaster, Vector2 } from 'three'

/**
 * Class for enabling object selection vie ray casting
 */
export default class ObjectSelection {
  constructor(camera) {
    this._intersectableObjects = []

    this._camera = camera

    this._rayCaster = new Raycaster()
    this._mouse = new Vector2(0, 0)
  }

  /**
   * Makes the given object intersectable
   *
   * @param {Object3D} object The object that should be intersectable
   */
  addObject(object) {
    this._intersectableObjects.push(object)
  }

  /**
   * Updates the mouse position and the ray caster
   *
   * @param {number} xPosition The new x position of the mouse
   * @param {number} yPosition The new y position of the mouse
   */
  setMousePosition(xPosition, yPosition) {
    this._mouse.set((xPosition / window.innerWidth) * 2 - 1, -(yPosition / window.innerHeight) * 2 + 1)
    this._rayCaster.setFromCamera(this._mouse, this._camera)
  }

  /**
   * Checks ray intersection for the given objects
   *
   * @param {Object3D[]} objects The objects that should be considered for intersection
   * @returns {Object3D[]} List of the objects that intersect with the mouse position
   */
  intersectSpecific(objects = []) {
    return this._rayCaster.intersectObjects(objects)
  }

  /**
   * Checks ray intersection for the set objects
   *
   * @returns {Object3D[]} List of the objects that intersect with the mouse position
   */
  intersect() {
    return this._rayCaster.intersectObjects(this._intersectableObjects)
  }

  /**
   * Removes all intersectable objects
   */
  clear() {
    this._intersectableObjects = []
  }
}
