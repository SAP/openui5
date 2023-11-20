sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var class2type = {};
  var hasOwn = class2type.hasOwnProperty;
  var toString = class2type.toString;
  var fnToString = hasOwn.toString;
  var ObjectFunctionString = fnToString.call(Object);
  var fnIsPlainObject = function (obj) {
    var proto, Ctor;
    if (!obj || toString.call(obj) !== "[object Object]") {
      return false;
    }
    proto = Object.getPrototypeOf(obj);
    if (!proto) {
      return true;
    }
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
  };
  var _default = fnIsPlainObject;
  _exports.default = _default;
});