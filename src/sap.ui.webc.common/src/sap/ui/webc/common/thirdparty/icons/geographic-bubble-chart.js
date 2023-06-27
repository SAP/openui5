sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/geographic-bubble-chart", "./v5/geographic-bubble-chart"], function (_exports, _Theme, _geographicBubbleChart, _geographicBubbleChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _geographicBubbleChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _geographicBubbleChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _geographicBubbleChart.pathData : _geographicBubbleChart2.pathData;
  _exports.pathData = pathData;
  var _default = "geographic-bubble-chart";
  _exports.default = _default;
});