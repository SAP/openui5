sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns a property decorator.
   *
   * @param { Property } propData
   * @returns { PropertyDecorator }
   */
  const property = propData => {
    return (target, propertyKey) => {
      const ctor = target.constructor;
      if (!Object.prototype.hasOwnProperty.call(ctor, "metadata")) {
        ctor.metadata = {};
      }
      const metadata = ctor.metadata;
      if (!metadata.properties) {
        metadata.properties = {};
      }
      const propsMetadata = metadata.properties;
      if (!propsMetadata[propertyKey]) {
        propsMetadata[propertyKey] = propData || {
          type: String
        };
      }
    };
  };
  var _default = property;
  _exports.default = _default;
});