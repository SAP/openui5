sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/draw-rectangle", "./v5/draw-rectangle"], function (_exports, _Theme, _drawRectangle, _drawRectangle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _drawRectangle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _drawRectangle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _drawRectangle.pathData : _drawRectangle2.pathData;
  _exports.pathData = pathData;
  var _default = "draw-rectangle";
  _exports.default = _default;
});