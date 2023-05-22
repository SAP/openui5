sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/drill-up", "./v5/drill-up"], function (_exports, _Theme, _drillUp, _drillUp2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _drillUp.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _drillUp.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _drillUp.pathData : _drillUp2.pathData;
  _exports.pathData = pathData;
  var _default = "drill-up";
  _exports.default = _default;
});