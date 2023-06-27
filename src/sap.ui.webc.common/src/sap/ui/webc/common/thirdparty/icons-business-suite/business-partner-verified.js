sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/business-partner-verified", "./v2/business-partner-verified"], function (_exports, _Theme, _businessPartnerVerified, _businessPartnerVerified2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessPartnerVerified.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessPartnerVerified.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessPartnerVerified.pathData : _businessPartnerVerified2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/business-partner-verified";
  _exports.default = _default;
});