sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/horizontal-waterfall-chart", "./v5/horizontal-waterfall-chart"], function (_exports, _Theme, _horizontalWaterfallChart, _horizontalWaterfallChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _horizontalWaterfallChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _horizontalWaterfallChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _horizontalWaterfallChart.pathData : _horizontalWaterfallChart2.pathData;
  _exports.pathData = pathData;
  var _default = "horizontal-waterfall-chart";
  _exports.default = _default;
});