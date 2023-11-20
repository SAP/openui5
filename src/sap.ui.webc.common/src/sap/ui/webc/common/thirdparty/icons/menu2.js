sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/menu2", "./v5/menu2"], function (_exports, _Theme, _menu, _menu2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _menu.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _menu.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _menu.pathData : _menu2.pathData;
  _exports.pathData = pathData;
  var _default = "menu2";
  _exports.default = _default;
});