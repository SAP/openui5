sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/exit-full-screen", "./v5/exit-full-screen"], function (_exports, _Theme, _exitFullScreen, _exitFullScreen2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _exitFullScreen.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _exitFullScreen.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _exitFullScreen.pathData : _exitFullScreen2.pathData;
  _exports.pathData = pathData;
  var _default = "exit-full-screen";
  _exports.default = _default;
});