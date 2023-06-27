sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/fallback", "./v5/fallback"], function (_exports, _Theme, _fallback, _fallback2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fallback.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fallback.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fallback.pathData : _fallback2.pathData;
  _exports.pathData = pathData;
  var _default = "fallback";
  _exports.default = _default;
});