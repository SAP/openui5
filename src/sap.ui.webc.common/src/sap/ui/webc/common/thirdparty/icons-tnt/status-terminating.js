sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/status-terminating", "./v3/status-terminating"], function (_exports, _Theme, _statusTerminating, _statusTerminating2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusTerminating.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusTerminating.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusTerminating.pathData : _statusTerminating2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/status-terminating";
  _exports.default = _default;
});