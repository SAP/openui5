sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/money-bills", "./v5/money-bills"], function (_exports, _Theme, _moneyBills, _moneyBills2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _moneyBills.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _moneyBills.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _moneyBills.pathData : _moneyBills2.pathData;
  _exports.pathData = pathData;
  var _default = "money-bills";
  _exports.default = _default;
});