sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiple-bar-chart", "./v5/multiple-bar-chart"], function (_exports, _Theme, _multipleBarChart, _multipleBarChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multipleBarChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multipleBarChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multipleBarChart.pathData : _multipleBarChart2.pathData;
  _exports.pathData = pathData;
  var _default = "multiple-bar-chart";
  _exports.default = _default;
});