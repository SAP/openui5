sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vertical-stacked-chart", "./v5/vertical-stacked-chart"], function (_exports, _Theme, _verticalStackedChart, _verticalStackedChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _verticalStackedChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _verticalStackedChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _verticalStackedChart.pathData : _verticalStackedChart2.pathData;
  _exports.pathData = pathData;
  var _default = "vertical-stacked-chart";
  _exports.default = _default;
});