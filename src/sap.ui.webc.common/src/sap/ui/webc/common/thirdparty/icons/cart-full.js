sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cart-full", "./v5/cart-full"], function (_exports, _Theme, _cartFull, _cartFull2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cartFull.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cartFull.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cartFull.pathData : _cartFull2.pathData;
  _exports.pathData = pathData;
  var _default = "cart-full";
  _exports.default = _default;
});