sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/screen-split-two", "./v5/screen-split-two"], function (_exports, _Theme, _screenSplitTwo, _screenSplitTwo2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _screenSplitTwo.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _screenSplitTwo.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _screenSplitTwo.pathData : _screenSplitTwo2.pathData;
  _exports.pathData = pathData;
  var _default = "screen-split-two";
  _exports.default = _default;
});