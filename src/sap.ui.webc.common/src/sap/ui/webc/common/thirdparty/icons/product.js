sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/product", "./v5/product"], function (_exports, _Theme, _product, _product2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _product.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _product.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _product.pathData : _product2.pathData;
  _exports.pathData = pathData;
  var _default = "product";
  _exports.default = _default;
});