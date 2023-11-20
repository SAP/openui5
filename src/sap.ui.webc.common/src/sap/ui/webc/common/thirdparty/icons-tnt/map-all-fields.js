sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/map-all-fields", "./v3/map-all-fields"], function (_exports, _Theme, _mapAllFields, _mapAllFields2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mapAllFields.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mapAllFields.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mapAllFields.pathData : _mapAllFields2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/map-all-fields";
  _exports.default = _default;
});