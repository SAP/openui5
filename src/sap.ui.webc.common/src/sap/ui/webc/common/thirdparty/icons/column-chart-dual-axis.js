sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/column-chart-dual-axis", "./v5/column-chart-dual-axis"], function (_exports, _Theme, _columnChartDualAxis, _columnChartDualAxis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _columnChartDualAxis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _columnChartDualAxis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _columnChartDualAxis.pathData : _columnChartDualAxis2.pathData;
  _exports.pathData = pathData;
  var _default = "column-chart-dual-axis";
  _exports.default = _default;
});