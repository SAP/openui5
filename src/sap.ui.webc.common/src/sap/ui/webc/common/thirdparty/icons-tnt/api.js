sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/api", "./v3/api"], function (_exports, _Theme, _api, _api2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _api.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _api.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _api.pathData : _api2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/api";
  _exports.default = _default;
});