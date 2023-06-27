sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/retail-store-manager", "./v5/retail-store-manager"], function (_exports, _Theme, _retailStoreManager, _retailStoreManager2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _retailStoreManager.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _retailStoreManager.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _retailStoreManager.pathData : _retailStoreManager2.pathData;
  _exports.pathData = pathData;
  var _default = "retail-store-manager";
  _exports.default = _default;
});