sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/resize-horizontal", "./v5/resize-horizontal"], function (_exports, _Theme, _resizeHorizontal, _resizeHorizontal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _resizeHorizontal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _resizeHorizontal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _resizeHorizontal.pathData : _resizeHorizontal2.pathData;
  _exports.pathData = pathData;
  var _default = "resize-horizontal";
  _exports.default = _default;
});