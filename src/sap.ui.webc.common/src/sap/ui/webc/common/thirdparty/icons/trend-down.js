sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/trend-down", "./v4/trend-down"], function (_exports, _Theme, _trendDown, _trendDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trendDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trendDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _trendDown.pathData : _trendDown2.pathData;
  _exports.pathData = pathData;
  var _default = "trend-down";
  _exports.default = _default;
});