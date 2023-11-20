sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @class
   * DOM Element reference or ID.
   * <b>Note:</b> If an ID is passed, it is expected to be part of the same <code>document</code> element as the consuming component.
   *
   * @constructor
   * @extends sap.ui.webc.base.types.DataType
   * @author SAP SE
   * @alias sap.ui.webc.base.types.DOMReference
   * @public
   */
  class DOMReference extends _DataType.default {
    static isValid(value) {
      return typeof value === "string" || value instanceof HTMLElement;
    }
    static propertyToAttribute(propertyValue) {
      if (propertyValue instanceof HTMLElement) {
        return null;
      }
      return propertyValue;
    }
  }
  var _default = DOMReference;
  _exports.default = _default;
});