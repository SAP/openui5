sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/business-partner-anonymous", "./v2/business-partner-anonymous"], function (_exports, _Theme, _businessPartnerAnonymous, _businessPartnerAnonymous2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessPartnerAnonymous.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessPartnerAnonymous.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessPartnerAnonymous.pathData : _businessPartnerAnonymous2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/business-partner-anonymous";
  _exports.default = _default;
});