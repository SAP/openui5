sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer", "./v5/customer"], function (_exports, _Theme, _customer, _customer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customer.pathData : _customer2.pathData;
  _exports.pathData = pathData;
  var _default = "customer";
  _exports.default = _default;
});