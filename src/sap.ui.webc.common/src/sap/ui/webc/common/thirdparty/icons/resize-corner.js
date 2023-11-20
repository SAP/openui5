sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/resize-corner", "./v5/resize-corner"], function (_exports, _Theme, _resizeCorner, _resizeCorner2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _resizeCorner.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _resizeCorner.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _resizeCorner.pathData : _resizeCorner2.pathData;
  _exports.pathData = pathData;
  var _default = "resize-corner";
  _exports.default = _default;
});