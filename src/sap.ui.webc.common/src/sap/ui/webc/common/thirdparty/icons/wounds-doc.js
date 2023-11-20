sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/wounds-doc", "./v5/wounds-doc"], function (_exports, _Theme, _woundsDoc, _woundsDoc2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _woundsDoc.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _woundsDoc.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _woundsDoc.pathData : _woundsDoc2.pathData;
  _exports.pathData = pathData;
  var _default = "wounds-doc";
  _exports.default = _default;
});