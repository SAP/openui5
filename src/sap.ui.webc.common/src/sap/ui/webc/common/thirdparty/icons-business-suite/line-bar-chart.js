sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/line-bar-chart", "./v2/line-bar-chart"], function (_exports, _Theme, _lineBarChart, _lineBarChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lineBarChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lineBarChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lineBarChart.pathData : _lineBarChart2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/line-bar-chart";
  _exports.default = _default;
});