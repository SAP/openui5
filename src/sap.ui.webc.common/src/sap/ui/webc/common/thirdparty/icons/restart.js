sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/restart", "./v5/restart"], function (_exports, _Theme, _restart, _restart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _restart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _restart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _restart.pathData : _restart2.pathData;
  _exports.pathData = pathData;
  var _default = "restart";
  _exports.default = _default;
});