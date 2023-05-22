sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/utilization", "./v2/utilization"], function (_exports, _Theme, _utilization, _utilization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _utilization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _utilization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _utilization.pathData : _utilization2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/utilization";
  _exports.default = _default;
});