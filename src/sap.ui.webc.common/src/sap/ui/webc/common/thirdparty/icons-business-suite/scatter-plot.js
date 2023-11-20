sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/scatter-plot", "./v2/scatter-plot"], function (_exports, _Theme, _scatterPlot, _scatterPlot2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _scatterPlot.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _scatterPlot.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _scatterPlot.pathData : _scatterPlot2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/scatter-plot";
  _exports.default = _default;
});