sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/foil", "./v2/foil"], function (_exports, _Theme, _foil, _foil2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _foil.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _foil.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _foil.pathData : _foil2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/foil";
  _exports.default = _default;
});