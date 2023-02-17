sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const getClassCopy = (klass, constructorCallback) => {
    return class classCopy extends klass {
      constructor() {
        super();
        constructorCallback && constructorCallback();
      }
    };
  };
  var _default = getClassCopy;
  _exports.default = _default;
});