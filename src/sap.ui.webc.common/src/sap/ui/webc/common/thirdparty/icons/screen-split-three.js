sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/screen-split-three", "./v5/screen-split-three"], function (_exports, _Theme, _screenSplitThree, _screenSplitThree2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _screenSplitThree.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _screenSplitThree.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _screenSplitThree.pathData : _screenSplitThree2.pathData;
  _exports.pathData = pathData;
  var _default = "screen-split-three";
  _exports.default = _default;
});