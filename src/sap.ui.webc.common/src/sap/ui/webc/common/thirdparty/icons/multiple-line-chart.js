sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiple-line-chart", "./v5/multiple-line-chart"], function (_exports, _Theme, _multipleLineChart, _multipleLineChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multipleLineChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multipleLineChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multipleLineChart.pathData : _multipleLineChart2.pathData;
  _exports.pathData = pathData;
  var _default = "multiple-line-chart";
  _exports.default = _default;
});