sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/error", "./v5/error"], function (_exports, _Theme, _error, _error2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _error.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _error.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _error.pathData : _error2.pathData;
  _exports.pathData = pathData;
  var _default = "error";
  _exports.default = _default;
});