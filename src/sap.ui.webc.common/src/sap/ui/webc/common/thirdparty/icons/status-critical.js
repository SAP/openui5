sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/status-critical", "./v5/status-critical"], function (_exports, _Theme, _statusCritical, _statusCritical2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusCritical.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusCritical.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusCritical.pathData : _statusCritical2.pathData;
  _exports.pathData = pathData;
  var _default = "status-critical";
  _exports.default = _default;
});