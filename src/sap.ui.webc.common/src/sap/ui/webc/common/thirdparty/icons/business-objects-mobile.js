sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/business-objects-mobile", "./v5/business-objects-mobile"], function (_exports, _Theme, _businessObjectsMobile, _businessObjectsMobile2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessObjectsMobile.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessObjectsMobile.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessObjectsMobile.pathData : _businessObjectsMobile2.pathData;
  _exports.pathData = pathData;
  var _default = "business-objects-mobile";
  _exports.default = _default;
});