sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vertical-bullet-chart", "./v5/vertical-bullet-chart"], function (_exports, _Theme, _verticalBulletChart, _verticalBulletChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _verticalBulletChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _verticalBulletChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _verticalBulletChart.pathData : _verticalBulletChart2.pathData;
  _exports.pathData = pathData;
  var _default = "vertical-bullet-chart";
  _exports.default = _default;
});