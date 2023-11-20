sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/business-partner", "./v2/business-partner"], function (_exports, _Theme, _businessPartner, _businessPartner2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessPartner.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessPartner.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessPartner.pathData : _businessPartner2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/business-partner";
  _exports.default = _default;
});