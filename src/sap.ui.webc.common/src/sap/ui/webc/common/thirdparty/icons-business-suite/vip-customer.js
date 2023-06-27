sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/vip-customer", "./v2/vip-customer"], function (_exports, _Theme, _vipCustomer, _vipCustomer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _vipCustomer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _vipCustomer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _vipCustomer.pathData : _vipCustomer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/vip-customer";
  _exports.default = _default;
});