sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/early-widthdrawal-for-time-deposits", "./v2/early-widthdrawal-for-time-deposits"], function (_exports, _Theme, _earlyWidthdrawalForTimeDeposits, _earlyWidthdrawalForTimeDeposits2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _earlyWidthdrawalForTimeDeposits.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _earlyWidthdrawalForTimeDeposits.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _earlyWidthdrawalForTimeDeposits.pathData : _earlyWidthdrawalForTimeDeposits2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/early-widthdrawal-for-time-deposits";
  _exports.default = _default;
});