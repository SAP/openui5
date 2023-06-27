sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/trend-up", "./v5/trend-up"], function (_exports, _Theme, _trendUp, _trendUp2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trendUp.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trendUp.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _trendUp.pathData : _trendUp2.pathData;
  _exports.pathData = pathData;
  var _default = "trend-up";
  _exports.default = _default;
});