sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of AnimationMode.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.AnimationMode
   */
  var AnimationMode;
  (function (AnimationMode) {
    /**
     * @public
     * @type {Full}
     */
    AnimationMode["Full"] = "full";
    /**
     * @public
     * @type {Basic}
     */
    AnimationMode["Basic"] = "basic";
    /**
     * @public
     * @type {Minimal}
     */
    AnimationMode["Minimal"] = "minimal";
    /**
     * @public
     * @type {None}
     */
    AnimationMode["None"] = "none";
  })(AnimationMode || (AnimationMode = {}));
  var _default = AnimationMode;
  _exports.default = _default;
});