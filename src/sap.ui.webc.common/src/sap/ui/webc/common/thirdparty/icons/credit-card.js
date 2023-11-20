sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/credit-card", "./v5/credit-card"], function (_exports, _Theme, _creditCard, _creditCard2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _creditCard.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _creditCard.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _creditCard.pathData : _creditCard2.pathData;
  _exports.pathData = pathData;
  var _default = "credit-card";
  _exports.default = _default;
});