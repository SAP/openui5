sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/business-partner-self-identified", "./v2/business-partner-self-identified"], function (_exports, _Theme, _businessPartnerSelfIdentified, _businessPartnerSelfIdentified2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessPartnerSelfIdentified.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessPartnerSelfIdentified.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessPartnerSelfIdentified.pathData : _businessPartnerSelfIdentified2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/business-partner-self-identified";
  _exports.default = _default;
});