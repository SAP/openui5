sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/product-view", "./v2/product-view"], function (_exports, _Theme, _productView, _productView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _productView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _productView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _productView.pathData : _productView2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/product-view";
  _exports.default = _default;
});