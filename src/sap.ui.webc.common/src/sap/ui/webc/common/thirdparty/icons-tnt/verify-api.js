sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/verify-api", "./v3/verify-api"], function (_exports, _Theme, _verifyApi, _verifyApi2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _verifyApi.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _verifyApi.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _verifyApi.pathData : _verifyApi2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/verify-api";
  _exports.default = _default;
});