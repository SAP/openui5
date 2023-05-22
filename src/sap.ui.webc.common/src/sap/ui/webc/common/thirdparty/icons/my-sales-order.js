sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/my-sales-order", "./v5/my-sales-order"], function (_exports, _Theme, _mySalesOrder, _mySalesOrder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mySalesOrder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mySalesOrder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mySalesOrder.pathData : _mySalesOrder2.pathData;
  _exports.pathData = pathData;
  var _default = "my-sales-order";
  _exports.default = _default;
});