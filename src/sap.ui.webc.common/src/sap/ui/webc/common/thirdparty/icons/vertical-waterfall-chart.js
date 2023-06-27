sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vertical-waterfall-chart", "./v5/vertical-waterfall-chart"], function (_exports, _Theme, _verticalWaterfallChart, _verticalWaterfallChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _verticalWaterfallChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _verticalWaterfallChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _verticalWaterfallChart.pathData : _verticalWaterfallChart2.pathData;
  _exports.pathData = pathData;
  var _default = "vertical-waterfall-chart";
  _exports.default = _default;
});