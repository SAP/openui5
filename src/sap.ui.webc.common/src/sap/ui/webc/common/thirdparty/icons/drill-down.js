sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/drill-down", "./v5/drill-down"], function (_exports, _Theme, _drillDown, _drillDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _drillDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _drillDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _drillDown.pathData : _drillDown2.pathData;
  _exports.pathData = pathData;
  var _default = "drill-down";
  _exports.default = _default;
});