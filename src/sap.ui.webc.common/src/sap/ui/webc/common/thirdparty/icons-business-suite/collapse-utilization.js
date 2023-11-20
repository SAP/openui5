sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/collapse-utilization", "./v2/collapse-utilization"], function (_exports, _Theme, _collapseUtilization, _collapseUtilization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collapseUtilization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collapseUtilization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collapseUtilization.pathData : _collapseUtilization2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/collapse-utilization";
  _exports.default = _default;
});