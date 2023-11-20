sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/status-terminated", "./v3/status-terminated"], function (_exports, _Theme, _statusTerminated, _statusTerminated2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusTerminated.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusTerminated.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusTerminated.pathData : _statusTerminated2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/status-terminated";
  _exports.default = _default;
});