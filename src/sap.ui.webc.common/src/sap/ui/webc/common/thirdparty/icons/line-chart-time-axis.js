sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/line-chart-time-axis", "./v5/line-chart-time-axis"], function (_exports, _Theme, _lineChartTimeAxis, _lineChartTimeAxis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lineChartTimeAxis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lineChartTimeAxis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lineChartTimeAxis.pathData : _lineChartTimeAxis2.pathData;
  _exports.pathData = pathData;
  var _default = "line-chart-time-axis";
  _exports.default = _default;
});