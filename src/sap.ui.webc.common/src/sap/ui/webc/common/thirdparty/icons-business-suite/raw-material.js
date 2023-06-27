sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/raw-material", "./v2/raw-material"], function (_exports, _Theme, _rawMaterial, _rawMaterial2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _rawMaterial.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _rawMaterial.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _rawMaterial.pathData : _rawMaterial2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/raw-material";
  _exports.default = _default;
});