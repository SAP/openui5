sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const querySets = {};

  /**
   * Initializes a screen width media query range set.
   *
   * This initialization step makes the range set ready to be used for one of the other functions in namespace <code>MediaRange</code>.
   *
   * A range set can be defined as shown in the following example:
   * <pre>
   * MediaRange.initRangeSet("MyRangeSet", [200, 400], ["Small", "Medium", "Large"]);
   * </pre>
   * This example defines the following named ranges:
   * <ul>
   * <li><code>"Small"</code>: For screens smaller than 200 pixels.</li>
   * <li><code>"Medium"</code>: For screens greater than or equal to 200 pixels and smaller than 400 pixels.</li>
   * <li><code>"Large"</code>: For screens greater than or equal to 400 pixels.</li>
   * </ul>
   *
   * @param {string} name The name of the range set to be initialized.
   * The name must be a valid id and consist only of letters and numeric digits.
   *
   * @param {int[]} [borders] The range borders
   *
   * @param {string[]} [names] The names of the ranges. The names must be a valid id and consist only of letters and digits.
   *
   * @name MediaRange.initRangeSet
   * @function
   * @public
   */
  const _initRangeSet = (name, borders, names) => {
    querySets[name] = {
      borders,
      names
    };
  };

  /**
   * Returns information about the current active range of the range set with the given name.
   *
   * If the optional parameter <code>width</code> is given, the active range will be determined for that width,
   * otherwise it is determined for the current window size.
   *
   * @param {string} name The name of the range set. The range set must be initialized beforehand ({@link MediaRange.initRangeSet})
   * @param {int} [width] An optional width, based on which the range should be determined;
   *             If <code>width</code> is not provided, the window size will be used.
   * @returns {string} The name of the current active interval of the range set.
   *
   * @name MediaRange.getCurrentRange
   * @function
   * @public
   */
  const _getCurrentRange = (name, width = window.innerWidth) => {
    const querySet = querySets[name];
    let i = 0;
    if (!querySet) {
      return null;
    }
    for (; i < querySet.borders.length; i++) {
      if (width < querySet.borders[i]) {
        return querySet.names[i];
      }
    }
    return querySet.names[i];
  };

  /**
   * Enumeration containing the names and settings of predefined screen width media query range sets.
   *
   * @namespace
   * @name MediaRange.RANGESETS
   * @public
   */
  const RANGESETS = {
    /**
     * A 4-step range set (S-M-L-XL).
     *
     * The ranges of this set are:
     * <ul>
     * <li><code>"S"</code>: For screens smaller than 600 pixels.</li>
     * <li><code>"M"</code>: For screens greater than or equal to 600 pixels and smaller than 1024 pixels.</li>
     * <li><code>"L"</code>: For screens greater than or equal to 1024 pixels and smaller than 1440 pixels.</li>
     * <li><code>"XL"</code>: For screens greater than or equal to 1440 pixels.</li>
     * </ul>
     *
     * @name MediaRange.RANGESETS.RANGE_4STEPS
     * @public
     */
    RANGE_4STEPS: "4Step"
  };

  /**
   * API for screen width changes.
   *
   * @namespace
   * @name MediaRange
   */

  const MediaRange = {
    RANGESETS,
    initRangeSet: _initRangeSet,
    getCurrentRange: _getCurrentRange
  };
  MediaRange.initRangeSet(MediaRange.RANGESETS.RANGE_4STEPS, [600, 1024, 1440], ["S", "M", "L", "XL"]);
  var _default = MediaRange;
  _exports.default = _default;
});