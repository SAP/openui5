sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/business-capability", "./v3/business-capability"], function (_exports, _Theme, _businessCapability, _businessCapability2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessCapability.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessCapability.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessCapability.pathData : _businessCapability2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/business-capability";
  _exports.default = _default;
});