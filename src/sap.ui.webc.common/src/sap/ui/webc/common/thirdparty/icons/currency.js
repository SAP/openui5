sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/currency", "./v5/currency"], function (_exports, _Theme, _currency, _currency2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _currency.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _currency.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _currency.pathData : _currency2.pathData;
  _exports.pathData = pathData;
  var _default = "currency";
  _exports.default = _default;
});