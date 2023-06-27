sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/bottle-cap", "./v2/bottle-cap"], function (_exports, _Theme, _bottleCap, _bottleCap2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bottleCap.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bottleCap.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bottleCap.pathData : _bottleCap2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/bottle-cap";
  _exports.default = _default;
});