sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/print", "./v4/print"], function (_exports, _Theme, _print, _print2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _print.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _print.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _print.pathData : _print2.pathData;
  _exports.pathData = pathData;
  var _default = "print";
  _exports.default = _default;
});