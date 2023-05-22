sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/megamenu", "./v5/megamenu"], function (_exports, _Theme, _megamenu, _megamenu2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _megamenu.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _megamenu.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _megamenu.pathData : _megamenu2.pathData;
  _exports.pathData = pathData;
  var _default = "megamenu";
  _exports.default = _default;
});