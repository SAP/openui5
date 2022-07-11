sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.SemanticColor.prototype
   * @public
   */
  const SemanticColors = {
    /**
     * Default color (brand color)
     * @public
     * @type {Default}
     */
    Default: "Default",

    /**
     * Positive color
     * @public
     * @type {Positive}
     */
    Positive: "Positive",

    /**
     * Negative color
     * @public
     * @type {Negative}
     */
    Negative: "Negative",

    /**
     * Critical color
     * @public
     * @type {Critical}
     */
    Critical: "Critical",

    /**
     * Neutral color.
     * @public
     * @type {Neutral}
     */
    Neutral: "Neutral"
  };
  /**
   * @class
   * Defines the semantic color
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.SemanticColor
   * @public
   * @enum {string}
   */

  class SemanticColor extends _DataType.default {
    static isValid(value) {
      return !!SemanticColors[value];
    }

  }

  SemanticColor.generateTypeAccessors(SemanticColors);
  var _default = SemanticColor;
  _exports.default = _default;
});