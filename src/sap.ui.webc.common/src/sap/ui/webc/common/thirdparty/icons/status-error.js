sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/status-error", "./v4/status-error"], function (_exports, _Theme, _statusError, _statusError2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusError.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusError.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _statusError.pathData : _statusError2.pathData;
  _exports.pathData = pathData;
  var _default = "status-error";
  _exports.default = _default;
});