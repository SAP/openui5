sap.ui.define(["exports", "./isPlainObject"], function (_exports, _isPlainObject) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _isPlainObject = _interopRequireDefault(_isPlainObject);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var oToken = Object.create(null);
  var fnMerge = function (arg1, arg2, arg3, arg4) {
    var src,
      copyIsArray,
      copy,
      name,
      options,
      clone,
      target = arguments[2] || {},
      i = 3,
      length = arguments.length,
      deep = arguments[0] || false,
      skipToken = arguments[1] ? undefined : oToken;
    if (typeof target !== 'object' && typeof target !== 'function') {
      target = {};
    }
    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (name === '__proto__' || target === copy) {
            continue;
          }
          if (deep && copy && ((0, _isPlainObject.default)(copy) || (copyIsArray = Array.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && (0, _isPlainObject.default)(src) ? src : {};
            }
            target[name] = fnMerge(deep, arguments[1], clone, copy);
          } else if (copy !== skipToken) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  };
  var _default = fnMerge;
  _exports.default = _default;
});