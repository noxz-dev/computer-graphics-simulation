import { Vector3, Color } from 'three'

import BasicScene from './base/BasicScene'
import Plane from '../logic/wrapper/Plane'
import Circle from '../logic/wrapper/Circle'
import Fatline from '../logic/wrapper/Fatline'
import Bezier from '../logic/Bezier'
import Utils from '../utils/utils'
import ObjectSelection from '../utils/ObjectSelection'
import { BEZIER_STEP_SIZE } from '../config'

/**
 * Class for visualising the bezier functionality
 */
export default class BezierScene extends BasicScene {
  /**
   * Initialises a new BezierScene
   *
   * @param {number} width The width of the scene
   * @param {number} height The height of the scene
   * @param {HTMLCanvasElement} canvas The canvas on which the scene should be rendered
   */
  constructor(width, height, canvas) {
    super(width, height, canvas)

    this._bjectSelection = new ObjectSelection(this.camera)
    this._ackgroundPlane = new Plane(this.width, this.height)
    this._bjectSelection.addObject(this._ackgroundPlane)

    this._ontrolLines = []

    this._clickedCircle = null

    this._bzierLine = null
    this._bezierPoints = []

    // Lines for Casteljau
    this._greenLine = null
    this._blueLine = null
    this._redPoint = null

    // Lines for Bernstein diagram
    this._bernsteinFirstLine = null
    this._bernsteinSecondLine = null
    this._bernsteinThirdLine = null
    this._bernsteinFourthLine = null

    this._casteljauRunning = false

    this._bezier = new Bezier()

    this._bezierConfig = {
      stepSize: BEZIER_STEP_SIZE.toString(),
      animationTime: 1,
      t: 0.5,
      'Play Animation': async () => {
        if (this._bezier.controlPoints.length === 4 && !this._casteljauRunning) {
          this._casteljauRunning = true
          for (let i = 0; i <= 1.1; i += parseFloat(this._bezierConfig.stepSize)) {
            this.gui.__controllers[1].setValue(i)
            await Utils.sleep(this._bezierConfig.animationTime * 1000 * this._bezierConfig.stepSize)
          }
          this._casteljauRunning = false
        }
      }
    }

    let slider = this.gui.add(this._bezierConfig, 't', 0, 1, this._bezierConfig.stepSize).onChange((value) => {
      this._displayCasteljau(value)
    })

    let stepSizeGui = this.gui
      .add(this._bezierConfig, 'stepSize', ['1', '0.5', '0.2', '0.1', '0.01', '0.001'])
      .onChange((value) => {
        if (this._bezier !== undefined) {
          this._bezier.stepSize = parseFloat(value)
          this._displayBezier()
          slider.step(value)
        }
      })

    stepSizeGui.listen()

    this.gui.add(this._bezierConfig, 'animationTime', 0.001, 10, 0.001).onChange()

    this.gui.add(this._bezierConfig, 'Play Animation')

    document.addEventListener('mousedown', this._createControlPoint.bind(this), false)
    document.addEventListener('mousemove', this._mouseDragged.bind(this), false)
    document.addEventListener('mouseup', this._mouseUp.bind(this), false)
  }

  /**
   * Animation callback
   */
  animate() {
    super.animate(() => {})
  }

  /**
   * Callback-function for mouse clicked event.
   * Creates a new Controlpoint if user clicked the left mouse-button.
   * If all four controlpoints are created the bezier-curve is displayed
   *
   * @param {MouseEvent} event
   */
  _createControlPoint(event) {
    let target = event.target
    let tag = target.tagName
    if (tag != 'CANVAS') return

    event.preventDefault()
    if (event.button === 0) {
      this._bjectSelection.setMousePosition(event.clientX, event.clientY)
      const intersects = this._bjectSelection.intersect()

      if (intersects.length > 0) {
        const intersect = intersects[0]
        if (intersect.object === this._ackgroundPlane) {
          if (this._bezier.controlPoints.length < 4) {
            const circle = new Circle(10, 12)
            circle.updatePosition(intersect.point, intersect.face.normal)
            this._bjectSelection.addObject(circle)
            this._bezier.addControlPoint(circle)
            this.addObject(circle)
          }
          if (this._bezier.controlPoints.length === 4 && this._ontrolLines.length === 0) {
            for (let i = 0; i < 3; i++) {
              let line = new Fatline([
                this._bezier.controlPoints[i].position,
                this._bezier.controlPoints[i + 1].position
              ])
              this._ontrolLines.push(line)
              this.addObject(line)
            }
            this._displayBezier()
            this._displayCasteljau(this._bezierConfig.t)
          }
        } else {
          this._clickedCircle = intersect.object
        }
      }
    }
  }

  /**
   * Callback-function for mouse dragged event.
   * If mouse is being dragged on a control point recalculates and displays
   * the bezier curve.
   *
   * @param {MouseEvent} event
   */
  _mouseDragged(event) {
    if (this._clickedCircle !== null) {
      document.body.style.cursor = 'grab'
      this._bjectSelection.setMousePosition(event.clientX, event.clientY)
      const intersect = this._bjectSelection.intersectSpecific([this._ackgroundPlane])[0]
      this._clickedCircle.updatePosition(intersect.point, intersect.face.normal)
      for (let i = 0; i < this._bezier.controlPoints.length - 1; i++) {
        this._ontrolLines[i].updatePosition([
          this._bezier.controlPoints[i].position,
          this._bezier.controlPoints[i + 1].position
        ])
      }
      this._displayBezier()
      this._displayCasteljau(this._bezierConfig.t)
    }
  }

  /**
   * Renders bezier curve
   */
  _displayBezier() {
    this._bezierPoints = this._bezier.calculateCubicBezier()
    if (this._bzierLine === null) {
      this._displayBernsteinDiagram()
      this._bzierLine = new Fatline(this._bezierPoints, 0.004, this._calculateColors())
      this.addObject(this._bzierLine)
    } else {
      this._bzierLine.updatePosition(this._bezierPoints)
      this._bzierLine.updateColor(this._calculateColors())
    }
  }

  /**
   * Renders a berstein diagram
   */
  _displayBernsteinDiagram() {
    let t = 0
    let firstLinePoints = []
    let firstLineColors = []
    let secondLinePoints = []
    let secondLineColors = []
    let thirdLinePoints = []
    let thirdLineColors = []
    let fourthLinePoints = []
    let fourthLineColors = []

    for (let i = 0; i < this._bezier.factors.length; i += 4) {
      let firstFactor = this._bezier.factors[i]
      let secondFactor = this._bezier.factors[i + 1]
      let thirdFactor = this._bezier.factors[i + 2]
      let fourthFactor = this._bezier.factors[i + 3]

      let firstColorDegree = 0
      let secondColorDegree = 0.3
      let thirdColorDegree = 0.66
      let fourthColorDegree = 0.8

      let firstVertex = this._calculatePolynomVertex(t, firstFactor, firstColorDegree)
      firstLinePoints.push(firstVertex.point)
      firstLineColors.push(firstVertex.color.r, firstVertex.color.g, firstVertex.color.b)

      let secondVertex = this._calculatePolynomVertex(t, secondFactor, secondColorDegree)
      secondLinePoints.push(secondVertex.point)
      secondLineColors.push(secondVertex.color.r, secondVertex.color.g, secondVertex.color.b)

      let thirdVertex = this._calculatePolynomVertex(t, thirdFactor, thirdColorDegree)
      thirdLinePoints.push(thirdVertex.point)
      thirdLineColors.push(thirdVertex.color.r, thirdVertex.color.g, thirdVertex.color.b)

      let fourthVertex = this._calculatePolynomVertex(t, fourthFactor, fourthColorDegree)
      fourthLinePoints.push(fourthVertex.point)
      fourthLineColors.push(fourthVertex.color.r, fourthVertex.color.g, fourthVertex.color.b)
      t += parseFloat(this._bezierConfig.stepSize)
    }

    let polynomLineWidth = 0.002

    this._bernsteinFirstLine = new Fatline(firstLinePoints, polynomLineWidth, firstLineColors)
    this._bernsteinSecondLine = new Fatline(secondLinePoints, polynomLineWidth, secondLineColors)
    this._bernsteinThirdLine = new Fatline(thirdLinePoints, polynomLineWidth, thirdLineColors)
    this._bernsteinFourthLine = new Fatline(fourthLinePoints, polynomLineWidth, fourthLineColors)

    this.addObject(this._bernsteinFirstLine)
    this.addObject(this._bernsteinSecondLine)
    this.addObject(this._bernsteinThirdLine)
    this.addObject(this._bernsteinFourthLine)
  }

  /**
   * Calculates a vertex for for the berstein diagram
   */
  _calculatePolynomVertex(t, factor, colorDegree) {
    let color = new Color()
    color.setHSL(colorDegree, 1, 0.5)
    return {
      point: new Vector3(t * 100 + this.width * 0.4, -this.height / 2 + 30 + factor * 100, 0),
      color: {
        r: color.r,
        g: color.g,
        b: color.b
      }
    }
  }

  /**
   * Calculates the colors for berstein representation
   *
   * @returns {number[]} Array with RGB seperated color values
   */
  _calculateColors() {
    let colors = []
    for (let i = 0; i < this._bezier.factors.length; i += 4) {
      let firstFactor = this._bezier.factors[i]
      let secondFactor = this._bezier.factors[i + 1]
      let thirdFactor = this._bezier.factors[i + 2]
      let fourthFactor = this._bezier.factors[i + 3]

      let firstColorDegree = 0
      let secondColorDegree = 0.3
      let thirdColorDegree = 0.66
      let fourthColorDegree = 0.8

      let color = new Color()
      let temp = Math.max(Math.max(firstFactor, secondFactor), Math.max(thirdFactor, fourthFactor))
      let value =
        temp === firstFactor
          ? firstColorDegree
          : temp === secondFactor
          ? secondColorDegree
          : temp === thirdFactor
          ? thirdColorDegree
          : fourthColorDegree
      color.setHSL(value, 1, 0.5)
      colors.push(color.r, color.g, color.b)
    }
    return colors
  }

  /**
   * Displays the casteljau algorithm at time t
   *
   * @param {number} t The timestep
   */
  _displayCasteljau(t) {
    let points = this._bezier.controlPoints
    if (points.length === 4) {
      let posOne = points[0].position
      let posTwo = points[1].position
      let posThree = points[2].position
      let posFour = points[3].position

      let greenFirstPoint = this._getPercentagePosition(posOne, posTwo, t)
      let greenSecondPoint = this._getPercentagePosition(posTwo, posThree, t)
      let greenThirdPoint = this._getPercentagePosition(posThree, posFour, t)

      if (this._greenLine === null) {
        this._greenLine = new Fatline([greenFirstPoint, greenSecondPoint, greenThirdPoint], 0.0025, [
          0.18,
          0.8,
          0.44,
          0.18,
          0.8,
          0.44,
          0.18,
          0.8,
          0.44
        ])
        this.addObject(this._greenLine)
      } else {
        this._greenLine.updatePosition([greenFirstPoint, greenSecondPoint, greenThirdPoint])
      }

      let blueFirstPoint = this._getPercentagePosition(greenFirstPoint, greenSecondPoint, t)
      let blueSecondPoint = this._getPercentagePosition(greenSecondPoint, greenThirdPoint, t)

      if (this._blueLine === null) {
        this._blueLine = new Fatline([blueFirstPoint, blueSecondPoint], 0.0025, [0.4, 0.8, 1, 0.4, 0.8, 1, 0.4, 0.8, 1])
        this.addObject(this._blueLine)
      } else {
        this._blueLine.updatePosition([blueFirstPoint, blueSecondPoint])
      }

      let redPosition = this._getPercentagePosition(blueFirstPoint, blueSecondPoint, t)

      if (this._redPoint === null) {
        this._redPoint = new Circle(10, 10, 0xe74c3c)
        this._redPoint.position.copy(redPosition)
        this.addObject(this._redPoint)
      } else {
        this._redPoint.position.copy(redPosition)
      }
    }
  }

  /**
   * Calculates the position between two points at time t
   *
   * @param {Vector3} firstPoint The first point
   * @param {Vector3} secondPoint The second point
   * @param {number} t The time
   * @returns {Vector3} The position
   */
  _getPercentagePosition(firstPoint, secondPoint, t) {
    let tempFirst = firstPoint.clone()
    let tempSecond = secondPoint.clone()

    let difference = tempSecond.sub(tempFirst)

    return tempFirst.add(difference.multiplyScalar(t))
  }

  /**
   * Callback-fuction for mouseup event
   */
  _mouseUp() {
    document.body.style.cursor = 'default'
    this._clickedCircle = null
  }

  /**
   * Clears the entire scene
   */
  clearScene() {
    this._bjectSelection.clear()
    this._bjectSelection.addObject(this._ackgroundPlane)
    this._clickedCircle = null
    this._ontrolLines = []
    this._bezierPoints = []
    this._bezier.clear()
    this._bzierLine = null
    this._greenLine = null
    this._blueLine = null
    this._redPoint = null
    this._bezierConfig.stepSize = '0.001'
    this._bernsteinFirstLine = null
    this._bernsteinSecondLine = null
    this._bernsteinThirdLine = null
    this._bernsteinFourthLine = null
    this._bezier = new Bezier()
  }
}
