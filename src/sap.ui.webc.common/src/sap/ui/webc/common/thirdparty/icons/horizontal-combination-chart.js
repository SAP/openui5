sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/horizontal-combination-chart", "./v5/horizontal-combination-chart"], function (_exports, _Theme, _horizontalCombinationChart, _horizontalCombinationChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _horizontalCombinationChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _horizontalCombinationChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _horizontalCombinationChart.pathData : _horizontalCombinationChart2.pathData;
  _exports.pathData = pathData;
  var _default = "horizontal-combination-chart";
  _exports.default = _default;
});