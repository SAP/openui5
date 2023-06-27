sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/debit-card", "./v2/debit-card"], function (_exports, _Theme, _debitCard, _debitCard2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _debitCard.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _debitCard.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _debitCard.pathData : _debitCard2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/debit-card";
  _exports.default = _default;
});