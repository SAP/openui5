sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/chart-axis", "./v5/chart-axis"], function (_exports, _Theme, _chartAxis, _chartAxis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _chartAxis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _chartAxis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _chartAxis.pathData : _chartAxis2.pathData;
  _exports.pathData = pathData;
  var _default = "chart-axis";
  _exports.default = _default;
});