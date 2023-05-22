sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pixelate", "./v5/pixelate"], function (_exports, _Theme, _pixelate, _pixelate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pixelate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pixelate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pixelate.pathData : _pixelate2.pathData;
  _exports.pathData = pathData;
  var _default = "pixelate";
  _exports.default = _default;
});