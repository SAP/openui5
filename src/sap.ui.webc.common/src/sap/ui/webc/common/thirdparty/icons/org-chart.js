sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/org-chart", "./v5/org-chart"], function (_exports, _Theme, _orgChart, _orgChart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _orgChart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _orgChart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _orgChart.pathData : _orgChart2.pathData;
  _exports.pathData = pathData;
  var _default = "org-chart";
  _exports.default = _default;
});