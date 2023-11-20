sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/along-stacked-chart", "./v5/along-stacked-chart"], function (_exports, _Theme, _alongStackedChart, _alongStackedChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alongStackedChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alongStackedChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _alongStackedChart.pathData : _alongStackedChart2.pathData;
  _exports.pathData = pathData;
  var _default = "along-stacked-chart";
  _exports.default = _default;
});