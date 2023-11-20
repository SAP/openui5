sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/payment-approval", "./v5/payment-approval"], function (_exports, _Theme, _paymentApproval, _paymentApproval2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paymentApproval.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paymentApproval.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paymentApproval.pathData : _paymentApproval2.pathData;
  _exports.pathData = pathData;
  var _default = "payment-approval";
  _exports.default = _default;
});