sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/family-protection", "./v5/family-protection"], function (_exports, _Theme, _familyProtection, _familyProtection2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _familyProtection.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _familyProtection.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _familyProtection.pathData : _familyProtection2.pathData;
  _exports.pathData = pathData;
  var _default = "family-protection";
  _exports.default = _default;
});