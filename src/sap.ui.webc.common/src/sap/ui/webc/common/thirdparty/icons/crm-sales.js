sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/crm-sales", "./v5/crm-sales"], function (_exports, _Theme, _crmSales, _crmSales2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _crmSales.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _crmSales.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _crmSales.pathData : _crmSales2.pathData;
  _exports.pathData = pathData;
  var _default = "crm-sales";
  _exports.default = _default;
});