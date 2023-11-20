sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/check-availability", "./v5/check-availability"], function (_exports, _Theme, _checkAvailability, _checkAvailability2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _checkAvailability.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _checkAvailability.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _checkAvailability.pathData : _checkAvailability2.pathData;
  _exports.pathData = pathData;
  var _default = "check-availability";
  _exports.default = _default;
});