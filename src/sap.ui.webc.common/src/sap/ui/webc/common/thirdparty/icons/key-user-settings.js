sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/key-user-settings", "./v5/key-user-settings"], function (_exports, _Theme, _keyUserSettings, _keyUserSettings2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _keyUserSettings.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _keyUserSettings.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _keyUserSettings.pathData : _keyUserSettings2.pathData;
  _exports.pathData = pathData;
  var _default = "key-user-settings";
  _exports.default = _default;
});