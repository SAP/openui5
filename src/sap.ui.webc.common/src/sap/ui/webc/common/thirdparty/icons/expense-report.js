sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/expense-report", "./v5/expense-report"], function (_exports, _Theme, _expenseReport, _expenseReport2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expenseReport.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expenseReport.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expenseReport.pathData : _expenseReport2.pathData;
  _exports.pathData = pathData;
  var _default = "expense-report";
  _exports.default = _default;
});