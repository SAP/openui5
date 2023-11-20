sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/light-mode", "./v5/light-mode"], function (_exports, _Theme, _lightMode, _lightMode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lightMode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lightMode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lightMode.pathData : _lightMode2.pathData;
  _exports.pathData = pathData;
  var _default = "light-mode";
  _exports.default = _default;
});