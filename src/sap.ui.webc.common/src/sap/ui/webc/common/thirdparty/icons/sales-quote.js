sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sales-quote", "./v5/sales-quote"], function (_exports, _Theme, _salesQuote, _salesQuote2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _salesQuote.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _salesQuote.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _salesQuote.pathData : _salesQuote2.pathData;
  _exports.pathData = pathData;
  var _default = "sales-quote";
  _exports.default = _default;
});