sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/bullet-chart", "./v2/bullet-chart"], function (_exports, _Theme, _bulletChart, _bulletChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bulletChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bulletChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bulletChart.pathData : _bulletChart2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/bullet-chart";
  _exports.default = _default;
});