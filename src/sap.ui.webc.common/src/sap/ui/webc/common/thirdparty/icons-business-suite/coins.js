sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/coins", "./v2/coins"], function (_exports, _Theme, _coins, _coins2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _coins.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _coins.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _coins.pathData : _coins2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/coins";
  _exports.default = _default;
});