sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/status-suspended", "./v3/status-suspended"], function (_exports, _Theme, _statusSuspended, _statusSuspended2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusSuspended.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusSuspended.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusSuspended.pathData : _statusSuspended2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/status-suspended";
  _exports.default = _default;
});