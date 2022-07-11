sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/horizontal-stacked-chart", "./v4/horizontal-stacked-chart"], function (_exports, _Theme, _horizontalStackedChart, _horizontalStackedChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _horizontalStackedChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _horizontalStackedChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _horizontalStackedChart.pathData : _horizontalStackedChart2.pathData;
  _exports.pathData = pathData;
  var _default = "horizontal-stacked-chart";
  _exports.default = _default;
});