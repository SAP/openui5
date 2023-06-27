sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/screen-split-one", "./v5/screen-split-one"], function (_exports, _Theme, _screenSplitOne, _screenSplitOne2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _screenSplitOne.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _screenSplitOne.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _screenSplitOne.pathData : _screenSplitOne2.pathData;
  _exports.pathData = pathData;
  var _default = "screen-split-one";
  _exports.default = _default;
});