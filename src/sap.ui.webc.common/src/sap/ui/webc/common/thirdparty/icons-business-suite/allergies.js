sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/allergies", "./v2/allergies"], function (_exports, _Theme, _allergies, _allergies2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _allergies.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _allergies.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _allergies.pathData : _allergies2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/allergies";
  _exports.default = _default;
});