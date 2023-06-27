sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of AvatarShape.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.AvatarShape
   */
  var AvatarShape;
  (function (AvatarShape) {
    /**
     * Circular shape.
     * @public
     * @type {Circle}
     */
    AvatarShape["Circle"] = "Circle";
    /**
     * Square shape.
     * @public
     * @type {Square}
     */
    AvatarShape["Square"] = "Square";
  })(AvatarShape || (AvatarShape = {}));
  var _default = AvatarShape;
  _exports.default = _default;
});