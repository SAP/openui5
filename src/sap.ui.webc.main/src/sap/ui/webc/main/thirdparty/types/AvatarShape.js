sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of AvatarShape.
   * @lends sap.ui.webcomponents.main.types.AvatarShape.prototype
   * @public
   */
  const AvatarShapes = {
    /**
     * Circular shape.
     * @public
     * @type {Circle}
     */
    Circle: "Circle",

    /**
     * Square shape.
     * @public
     * @type {Square}
     */
    Square: "Square"
  };
  /**
   * @class
   * Different types of AvatarShape.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.AvatarShape
   * @public
   * @enum {string}
   */

  class AvatarShape extends _DataType.default {
    static isValid(value) {
      return !!AvatarShapes[value];
    }

  }

  AvatarShape.generateTypeAccessors(AvatarShapes);
  var _default = AvatarShape;
  _exports.default = _default;
});