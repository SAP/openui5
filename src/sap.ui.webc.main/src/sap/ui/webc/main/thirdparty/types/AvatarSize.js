sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of AvatarSize.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.AvatarSize
   */
  var AvatarSize;
  (function (AvatarSize) {
    /**
     * component size - 2rem
     * font size - 1rem
     * @public
     * @type { XS }
     */
    AvatarSize["XS"] = "XS";
    /**
     * component size - 3rem
     * font size - 1.5rem
     * @public
     * @type { S }
     */
    AvatarSize["S"] = "S";
    /**
     * component size - 4rem
     * font size - 2rem
     * @public
     * @type { M }
     */
    AvatarSize["M"] = "M";
    /**
     * component size - 5rem
     * font size - 2.5rem
     * @public
     * @type { L }
     */
    AvatarSize["L"] = "L";
    /**
     * component size - 7rem
     * font size - 3rem
     * @public
     * @type { XL }
     */
    AvatarSize["XL"] = "XL";
  })(AvatarSize || (AvatarSize = {}));
  var _default = AvatarSize;
  _exports.default = _default;
});