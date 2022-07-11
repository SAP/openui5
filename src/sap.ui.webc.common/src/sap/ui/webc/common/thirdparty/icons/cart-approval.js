sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/cart-approval", "./v4/cart-approval"], function (_exports, _Theme, _cartApproval, _cartApproval2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cartApproval.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cartApproval.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _cartApproval.pathData : _cartApproval2.pathData;
  _exports.pathData = pathData;
  var _default = "cart-approval";
  _exports.default = _default;
});