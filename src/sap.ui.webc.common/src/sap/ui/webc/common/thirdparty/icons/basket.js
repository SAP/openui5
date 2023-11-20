sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/basket", "./v5/basket"], function (_exports, _Theme, _basket, _basket2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _basket.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _basket.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _basket.pathData : _basket2.pathData;
  _exports.pathData = pathData;
  var _default = "basket";
  _exports.default = _default;
});