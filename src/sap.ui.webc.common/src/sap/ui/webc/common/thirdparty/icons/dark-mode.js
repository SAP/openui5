sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/dark-mode", "./v5/dark-mode"], function (_exports, _Theme, _darkMode, _darkMode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _darkMode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _darkMode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _darkMode.pathData : _darkMode2.pathData;
  _exports.pathData = pathData;
  var _default = "dark-mode";
  _exports.default = _default;
});