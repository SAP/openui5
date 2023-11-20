sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/line-chart", "./v5/line-chart"], function (_exports, _Theme, _lineChart, _lineChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lineChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lineChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lineChart.pathData : _lineChart2.pathData;
  _exports.pathData = pathData;
  var _default = "line-chart";
  _exports.default = _default;
});