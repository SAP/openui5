sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/border", "./v5/border"], function (_exports, _Theme, _border, _border2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _border.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _border.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _border.pathData : _border2.pathData;
  _exports.pathData = pathData;
  var _default = "border";
  _exports.default = _default;
});