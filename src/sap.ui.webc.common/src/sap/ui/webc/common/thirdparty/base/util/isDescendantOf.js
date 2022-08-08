sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const isDescendantOf = (klass, baseKlass, inclusive = false) => {
    if (typeof klass !== "function" || typeof baseKlass !== "function") {
      return false;
    }

    if (inclusive && klass === baseKlass) {
      return true;
    }

    let parent = klass;

    do {
      parent = Object.getPrototypeOf(parent);
    } while (parent !== null && parent !== baseKlass);

    return parent === baseKlass;
  };

  var _default = isDescendantOf;
  _exports.default = _default;
});