sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/line-chart-dual-axis", "./v5/line-chart-dual-axis"], function (_exports, _Theme, _lineChartDualAxis, _lineChartDualAxis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lineChartDualAxis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lineChartDualAxis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lineChartDualAxis.pathData : _lineChartDualAxis2.pathData;
  _exports.pathData = pathData;
  var _default = "line-chart-dual-axis";
  _exports.default = _default;
});