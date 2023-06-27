sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/choropleth-chart", "./v5/choropleth-chart"], function (_exports, _Theme, _choroplethChart, _choroplethChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _choroplethChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _choroplethChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _choroplethChart.pathData : _choroplethChart2.pathData;
  _exports.pathData = pathData;
  var _default = "choropleth-chart";
  _exports.default = _default;
});