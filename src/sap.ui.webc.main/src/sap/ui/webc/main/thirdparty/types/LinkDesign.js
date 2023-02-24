sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.LinkDesign.prototype
   * @public
   */
  const LinkTypes = {
    /**
     * default type (no special styling)
     * @public
     * @type {Default}
     */
    Default: "Default",
    /**
     * subtle type (appears as regular text, rather than a link)
     * @public
     * @type {Subtle}
     */
    Subtle: "Subtle",
    /**
     * emphasized type
     * @public
     * @type {Emphasized}
     */
    Emphasized: "Emphasized"
  };

  /**
   * @class
   * Different types of Button.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.LinkDesign
   * @public
   * @enum {string}
   */
  class LinkDesign extends _DataType.default {
    static isValid(value) {
      return !!LinkTypes[value];
    }
  }
  LinkDesign.generateTypeAccessors(LinkTypes);
  var _default = LinkDesign;
  _exports.default = _default;
});