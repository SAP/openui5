sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiple-pie-chart", "./v5/multiple-pie-chart"], function (_exports, _Theme, _multiplePieChart, _multiplePieChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multiplePieChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multiplePieChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multiplePieChart.pathData : _multiplePieChart2.pathData;
  _exports.pathData = pathData;
  var _default = "multiple-pie-chart";
  _exports.default = _default;
});