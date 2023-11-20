sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/health-tracking", "./v2/health-tracking"], function (_exports, _Theme, _healthTracking, _healthTracking2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _healthTracking.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _healthTracking.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _healthTracking.pathData : _healthTracking2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/health-tracking";
  _exports.default = _default;
});