sap.ui.define(["exports", "./_merge"], function (_exports, _merge2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _merge2 = _interopRequireDefault(_merge2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var fnMerge = function () {
    var args = [true, false];
    args.push.apply(args, arguments);
    return _merge2.default.apply(null, args);
  };
  var _default = fnMerge;
  _exports.default = _default;
});