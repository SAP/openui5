sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/software-item-variant", "./v2/software-item-variant"], function (_exports, _Theme, _softwareItemVariant, _softwareItemVariant2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _softwareItemVariant.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _softwareItemVariant.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _softwareItemVariant.pathData : _softwareItemVariant2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/software-item-variant";
  _exports.default = _default;
});