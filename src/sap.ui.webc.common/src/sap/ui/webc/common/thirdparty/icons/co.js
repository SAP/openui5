sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/co", "./v5/co"], function (_exports, _Theme, _co, _co2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _co.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _co.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _co.pathData : _co2.pathData;
  _exports.pathData = pathData;
  var _default = "co";
  _exports.default = _default;
});