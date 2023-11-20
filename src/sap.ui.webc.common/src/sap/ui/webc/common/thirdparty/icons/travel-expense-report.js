sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/travel-expense-report", "./v5/travel-expense-report"], function (_exports, _Theme, _travelExpenseReport, _travelExpenseReport2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _travelExpenseReport.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _travelExpenseReport.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _travelExpenseReport.pathData : _travelExpenseReport2.pathData;
  _exports.pathData = pathData;
  var _default = "travel-expense-report";
  _exports.default = _default;
});