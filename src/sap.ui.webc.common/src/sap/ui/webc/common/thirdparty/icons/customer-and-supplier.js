sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer-and-supplier", "./v5/customer-and-supplier"], function (_exports, _Theme, _customerAndSupplier, _customerAndSupplier2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customerAndSupplier.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customerAndSupplier.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customerAndSupplier.pathData : _customerAndSupplier2.pathData;
  _exports.pathData = pathData;
  var _default = "customer-and-supplier";
  _exports.default = _default;
});