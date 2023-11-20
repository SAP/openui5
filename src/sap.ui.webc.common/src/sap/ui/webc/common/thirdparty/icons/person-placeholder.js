sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/person-placeholder", "./v5/person-placeholder"], function (_exports, _Theme, _personPlaceholder, _personPlaceholder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _personPlaceholder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _personPlaceholder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _personPlaceholder.pathData : _personPlaceholder2.pathData;
  _exports.pathData = pathData;
  var _default = "person-placeholder";
  _exports.default = _default;
});