sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/area-chart", "./v5/area-chart"], function (_exports, _Theme, _areaChart, _areaChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _areaChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _areaChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _areaChart.pathData : _areaChart2.pathData;
  _exports.pathData = pathData;
  var _default = "area-chart";
  _exports.default = _default;
});