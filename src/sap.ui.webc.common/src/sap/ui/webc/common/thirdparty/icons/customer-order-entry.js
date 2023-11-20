sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer-order-entry", "./v5/customer-order-entry"], function (_exports, _Theme, _customerOrderEntry, _customerOrderEntry2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customerOrderEntry.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customerOrderEntry.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customerOrderEntry.pathData : _customerOrderEntry2.pathData;
  _exports.pathData = pathData;
  var _default = "customer-order-entry";
  _exports.default = _default;
});