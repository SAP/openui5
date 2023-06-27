sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/resize-vertical", "./v5/resize-vertical"], function (_exports, _Theme, _resizeVertical, _resizeVertical2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _resizeVertical.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _resizeVertical.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _resizeVertical.pathData : _resizeVertical2.pathData;
  _exports.pathData = pathData;
  var _default = "resize-vertical";
  _exports.default = _default;
});