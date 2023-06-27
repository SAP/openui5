sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/heatmap-chart", "./v5/heatmap-chart"], function (_exports, _Theme, _heatmapChart, _heatmapChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _heatmapChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _heatmapChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _heatmapChart.pathData : _heatmapChart2.pathData;
  _exports.pathData = pathData;
  var _default = "heatmap-chart";
  _exports.default = _default;
});