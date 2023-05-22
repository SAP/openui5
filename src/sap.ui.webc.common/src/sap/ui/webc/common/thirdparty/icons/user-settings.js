sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/user-settings", "./v5/user-settings"], function (_exports, _Theme, _userSettings, _userSettings2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _userSettings.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _userSettings.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _userSettings.pathData : _userSettings2.pathData;
  _exports.pathData = pathData;
  var _default = "user-settings";
  _exports.default = _default;
});