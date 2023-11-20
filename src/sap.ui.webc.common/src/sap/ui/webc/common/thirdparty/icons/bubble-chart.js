sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bubble-chart", "./v5/bubble-chart"], function (_exports, _Theme, _bubbleChart, _bubbleChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bubbleChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bubbleChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bubbleChart.pathData : _bubbleChart2.pathData;
  _exports.pathData = pathData;
  var _default = "bubble-chart";
  _exports.default = _default;
});