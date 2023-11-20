sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different input types.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.InputType
   */
  var InputType;
  (function (InputType) {
    /**
     * Defines a one-line text input field:
     * @public
     * @type {Text}
     */
    InputType["Text"] = "Text";
    /**
     * Used for input fields that must contain an e-mail address.
     * @public
     * @type {Email}
     */
    InputType["Email"] = "Email";
    /**
     * Defines a numeric input field.
     * @public
     * @type {Number}
     */
    InputType["Number"] = "Number";
    /**
     * Defines a password field.
     * @public
     * @type {Password}
     */
    InputType["Password"] = "Password";
    /**
     * Used for input fields that should contain a telephone number.
     * @public
     * @type {Tel}
     */
    InputType["Tel"] = "Tel";
    /**
     * Used for input fields that should contain a URL address.
     * @public
     * @type {URL}
     */
    InputType["URL"] = "URL";
  })(InputType || (InputType = {}));
  var _default = InputType;
  _exports.default = _default;
});