sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/eraser", "./v5/eraser"], function (_exports, _Theme, _eraser, _eraser2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _eraser.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _eraser.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _eraser.pathData : _eraser2.pathData;
  _exports.pathData = pathData;
  var _default = "eraser";
  _exports.default = _default;
});