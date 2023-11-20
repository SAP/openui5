sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/travel-expense", "./v5/travel-expense"], function (_exports, _Theme, _travelExpense, _travelExpense2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _travelExpense.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _travelExpense.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _travelExpense.pathData : _travelExpense2.pathData;
  _exports.pathData = pathData;
  var _default = "travel-expense";
  _exports.default = _default;
});