sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/status-suspending", "./v3/status-suspending"], function (_exports, _Theme, _statusSuspending, _statusSuspending2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusSuspending.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusSuspending.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusSuspending.pathData : _statusSuspending2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/status-suspending";
  _exports.default = _default;
});