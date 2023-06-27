sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/full-stacked-column-chart", "./v5/full-stacked-column-chart"], function (_exports, _Theme, _fullStackedColumnChart, _fullStackedColumnChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fullStackedColumnChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fullStackedColumnChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fullStackedColumnChart.pathData : _fullStackedColumnChart2.pathData;
  _exports.pathData = pathData;
  var _default = "full-stacked-column-chart";
  _exports.default = _default;
});