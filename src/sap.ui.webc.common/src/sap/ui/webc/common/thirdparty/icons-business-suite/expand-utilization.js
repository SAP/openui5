sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/expand-utilization", "./v2/expand-utilization"], function (_exports, _Theme, _expandUtilization, _expandUtilization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expandUtilization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expandUtilization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expandUtilization.pathData : _expandUtilization2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/expand-utilization";
  _exports.default = _default;
});