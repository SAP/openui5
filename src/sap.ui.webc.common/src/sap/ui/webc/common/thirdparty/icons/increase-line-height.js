sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/increase-line-height", "./v5/increase-line-height"], function (_exports, _Theme, _increaseLineHeight, _increaseLineHeight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _increaseLineHeight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _increaseLineHeight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _increaseLineHeight.pathData : _increaseLineHeight2.pathData;
  _exports.pathData = pathData;
  var _default = "increase-line-height";
  _exports.default = _default;
});