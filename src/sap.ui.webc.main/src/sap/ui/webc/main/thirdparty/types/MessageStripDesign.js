sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.MessageStripDesign.prototype
   * @public
   */
  const MessageStripDesigns = {
    /**
     * Message should be just an information
     * @public
     * @type {Information}
     */
    Information: "Information",

    /**
     * Message is a success message
     * @public
     * @type {Positive}
     */
    Positive: "Positive",

    /**
     * Message is an error
     * @public
     * @type {Negative}
     */
    Negative: "Negative",

    /**
     * Message is a warning
     * @public
     * @type {Warning}
     */
    Warning: "Warning"
  };
  /**
   * @class
   * Defines different types of MessageStrip.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.MessageStripDesign
   * @public
   * @enum {string}
   */

  class MessageStripDesign extends _DataType.default {
    static isValid(value) {
      return !!MessageStripDesigns[value];
    }

  }

  MessageStripDesign.generateTypeAccessors(MessageStripDesigns);
  var _default = MessageStripDesign;
  _exports.default = _default;
});