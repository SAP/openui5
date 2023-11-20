sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/color-fill", "./v5/color-fill"], function (_exports, _Theme, _colorFill, _colorFill2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _colorFill.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _colorFill.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _colorFill.pathData : _colorFill2.pathData;
  _exports.pathData = pathData;
  var _default = "color-fill";
  _exports.default = _default;
});