sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/crm-service-manager", "./v5/crm-service-manager"], function (_exports, _Theme, _crmServiceManager, _crmServiceManager2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _crmServiceManager.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _crmServiceManager.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _crmServiceManager.pathData : _crmServiceManager2.pathData;
  _exports.pathData = pathData;
  var _default = "crm-service-manager";
  _exports.default = _default;
});