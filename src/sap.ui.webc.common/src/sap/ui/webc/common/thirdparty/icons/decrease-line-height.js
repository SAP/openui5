sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/decrease-line-height", "./v5/decrease-line-height"], function (_exports, _Theme, _decreaseLineHeight, _decreaseLineHeight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _decreaseLineHeight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _decreaseLineHeight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _decreaseLineHeight.pathData : _decreaseLineHeight2.pathData;
  _exports.pathData = pathData;
  var _default = "decrease-line-height";
  _exports.default = _default;
});