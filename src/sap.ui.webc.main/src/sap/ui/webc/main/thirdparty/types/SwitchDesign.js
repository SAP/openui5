sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.SwitchDesign.prototype
   * @public
   */
  const SwitchDesigns = {
    /**
     * Defines the Switch as Textual
     * @public
     * @type {Textual}
     */
    Textual: "Textual",
    /**
     * Defines the Switch as Graphical
     * @public
     * @type {Graphical}
     */
    Graphical: "Graphical"
  };

  /**
   * @class
   * Defines input types
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.SwitchDesign
   * @public
   * @enum {string}
   */
  class SwitchDesign extends _DataType.default {
    static isValid(value) {
      return !!SwitchDesigns[value];
    }
  }
  SwitchDesign.generateTypeAccessors(SwitchDesigns);
  var _default = SwitchDesign;
  _exports.default = _default;
});