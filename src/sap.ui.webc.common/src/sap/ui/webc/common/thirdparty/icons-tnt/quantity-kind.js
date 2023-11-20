sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/quantity-kind", "./v3/quantity-kind"], function (_exports, _Theme, _quantityKind, _quantityKind2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _quantityKind.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _quantityKind.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _quantityKind.pathData : _quantityKind2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/quantity-kind";
  _exports.default = _default;
});