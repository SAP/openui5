sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/bank-account", "./v2/bank-account"], function (_exports, _Theme, _bankAccount, _bankAccount2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bankAccount.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bankAccount.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bankAccount.pathData : _bankAccount2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/bank-account";
  _exports.default = _default;
});