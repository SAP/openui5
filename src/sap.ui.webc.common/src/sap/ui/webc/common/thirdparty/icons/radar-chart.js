sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/radar-chart", "./v5/radar-chart"], function (_exports, _Theme, _radarChart, _radarChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _radarChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _radarChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _radarChart.pathData : _radarChart2.pathData;
  _exports.pathData = pathData;
  var _default = "radar-chart";
  _exports.default = _default;
});