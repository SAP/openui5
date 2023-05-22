sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/savings-account", "./v2/savings-account"], function (_exports, _Theme, _savingsAccount, _savingsAccount2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _savingsAccount.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _savingsAccount.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _savingsAccount.pathData : _savingsAccount2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/savings-account";
  _exports.default = _default;
});