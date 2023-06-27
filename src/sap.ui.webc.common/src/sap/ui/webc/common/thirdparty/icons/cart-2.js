sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cart-2", "./v5/cart-2"], function (_exports, _Theme, _cart, _cart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cart.pathData : _cart2.pathData;
  _exports.pathData = pathData;
  var _default = "cart-2";
  _exports.default = _default;
});