sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/scatter-chart", "./v5/scatter-chart"], function (_exports, _Theme, _scatterChart, _scatterChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _scatterChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _scatterChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _scatterChart.pathData : _scatterChart2.pathData;
  _exports.pathData = pathData;
  var _default = "scatter-chart";
  _exports.default = _default;
});