sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/products", "./v2/products"], function (_exports, _Theme, _products, _products2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _products.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _products.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _products.pathData : _products2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/products";
  _exports.default = _default;
});