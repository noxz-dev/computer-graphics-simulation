export default class Utils {
  /**
   * Lets the program sleep for a given time
   *
   * @param {number} milliseconds sleep time in milliseconds
   */
  static sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }

  /**
   * Converts an angle to radian
   *
   * @param {number} angle size of the angle
   */
  static toRadians(angle) {
    return angle * (Math.PI / 180)
  }
}
