sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sales-order-item", "./v5/sales-order-item"], function (_exports, _Theme, _salesOrderItem, _salesOrderItem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _salesOrderItem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _salesOrderItem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _salesOrderItem.pathData : _salesOrderItem2.pathData;
  _exports.pathData = pathData;
  var _default = "sales-order-item";
  _exports.default = _default;
});