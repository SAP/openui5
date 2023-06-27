sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/money-withdrawal", "./v2/money-withdrawal"], function (_exports, _Theme, _moneyWithdrawal, _moneyWithdrawal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _moneyWithdrawal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _moneyWithdrawal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _moneyWithdrawal.pathData : _moneyWithdrawal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/money-withdrawal";
  _exports.default = _default;
});