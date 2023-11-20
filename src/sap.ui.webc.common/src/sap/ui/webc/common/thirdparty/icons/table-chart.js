sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/table-chart", "./v5/table-chart"], function (_exports, _Theme, _tableChart, _tableChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tableChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tableChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tableChart.pathData : _tableChart2.pathData;
  _exports.pathData = pathData;
  var _default = "table-chart";
  _exports.default = _default;
});