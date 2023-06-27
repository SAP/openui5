sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/clear-all-mapping", "./v3/clear-all-mapping"], function (_exports, _Theme, _clearAllMapping, _clearAllMapping2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clearAllMapping.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clearAllMapping.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clearAllMapping.pathData : _clearAllMapping2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/clear-all-mapping";
  _exports.default = _default;
});