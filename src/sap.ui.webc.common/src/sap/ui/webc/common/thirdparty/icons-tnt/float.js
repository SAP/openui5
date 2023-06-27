sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/float", "./v3/float"], function (_exports, _Theme, _float, _float2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _float.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _float.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _float.pathData : _float2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/float";
  _exports.default = _default;
});