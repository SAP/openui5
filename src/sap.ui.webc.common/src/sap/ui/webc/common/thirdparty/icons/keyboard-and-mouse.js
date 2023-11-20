sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/keyboard-and-mouse", "./v5/keyboard-and-mouse"], function (_exports, _Theme, _keyboardAndMouse, _keyboardAndMouse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _keyboardAndMouse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _keyboardAndMouse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _keyboardAndMouse.pathData : _keyboardAndMouse2.pathData;
  _exports.pathData = pathData;
  var _default = "keyboard-and-mouse";
  _exports.default = _default;
});