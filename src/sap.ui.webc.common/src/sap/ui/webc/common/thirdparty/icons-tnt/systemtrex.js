sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/systemtrex", "./v3/systemtrex"], function (_exports, _Theme, _systemtrex, _systemtrex2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _systemtrex.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _systemtrex.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _systemtrex.pathData : _systemtrex2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/systemtrex";
  _exports.default = _default;
});