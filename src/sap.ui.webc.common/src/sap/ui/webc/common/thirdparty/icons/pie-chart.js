sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/pie-chart", "./v4/pie-chart"], function (_exports, _Theme, _pieChart, _pieChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pieChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pieChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _pieChart.pathData : _pieChart2.pathData;
  _exports.pathData = pathData;
  var _default = "pie-chart";
  _exports.default = _default;
});