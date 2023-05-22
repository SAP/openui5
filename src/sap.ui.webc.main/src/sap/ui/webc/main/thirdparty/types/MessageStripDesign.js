sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * MessageStrip designs.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.MessageStripDesign
   */
  var MessageStripDesign;
  (function (MessageStripDesign) {
    /**
     * Message should be just an information
     * @public
     * @type {Information}
     */
    MessageStripDesign["Information"] = "Information";
    /**
     * Message is a success message
     * @public
     * @type {Positive}
     */
    MessageStripDesign["Positive"] = "Positive";
    /**
     * Message is an error
     * @public
     * @type {Negative}
     */
    MessageStripDesign["Negative"] = "Negative";
    /**
     * Message is a warning
     * @public
     * @type {Warning}
     */
    MessageStripDesign["Warning"] = "Warning";
  })(MessageStripDesign || (MessageStripDesign = {}));
  var _default = MessageStripDesign;
  _exports.default = _default;
});