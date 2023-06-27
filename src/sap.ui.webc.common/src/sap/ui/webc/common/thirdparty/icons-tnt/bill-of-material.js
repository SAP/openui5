sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/bill-of-material", "./v3/bill-of-material"], function (_exports, _Theme, _billOfMaterial, _billOfMaterial2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _billOfMaterial.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _billOfMaterial.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _billOfMaterial.pathData : _billOfMaterial2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/bill-of-material";
  _exports.default = _default;
});