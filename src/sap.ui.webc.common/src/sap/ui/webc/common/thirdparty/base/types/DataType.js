sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Base class for all data types.
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.base.types.DataType
   * @public
   */
  class DataType {
    /**
     * Checks if the value is valid for its data type.
     * @public
     * @abstract
     * @returns {Boolean}
     */
    // eslint-disable-next-line
    static isValid(value) {
      return false;
    }
    static attributeToProperty(attributeValue) {
      return attributeValue;
    }
    static propertyToAttribute(propertyValue) {
      return propertyValue === null ? null : String(propertyValue);
    }
    static valuesAreEqual(value1, value2) {
      return value1 === value2;
    }
    static generateTypeAccessors(types) {
      Object.keys(types).forEach(type => {
        Object.defineProperty(this, type, {
          get() {
            return types[type];
          }
        });
      });
    }
    static get isDataTypeClass() {
      return true;
    }
  }
  var _default = DataType;
  _exports.default = _default;
});