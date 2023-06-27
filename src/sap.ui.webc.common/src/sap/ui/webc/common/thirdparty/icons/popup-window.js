sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/popup-window", "./v5/popup-window"], function (_exports, _Theme, _popupWindow, _popupWindow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _popupWindow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _popupWindow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _popupWindow.pathData : _popupWindow2.pathData;
  _exports.pathData = pathData;
  var _default = "popup-window";
  _exports.default = _default;
});