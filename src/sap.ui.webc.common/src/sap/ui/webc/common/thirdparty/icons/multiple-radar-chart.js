sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiple-radar-chart", "./v5/multiple-radar-chart"], function (_exports, _Theme, _multipleRadarChart, _multipleRadarChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multipleRadarChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multipleRadarChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multipleRadarChart.pathData : _multipleRadarChart2.pathData;
  _exports.pathData = pathData;
  var _default = "multiple-radar-chart";
  _exports.default = _default;
});