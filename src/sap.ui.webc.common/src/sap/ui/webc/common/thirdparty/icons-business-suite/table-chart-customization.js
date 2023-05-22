sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/table-chart-customization", "./v2/table-chart-customization"], function (_exports, _Theme, _tableChartCustomization, _tableChartCustomization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tableChartCustomization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tableChartCustomization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tableChartCustomization.pathData : _tableChartCustomization2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/table-chart-customization";
  _exports.default = _default;
});