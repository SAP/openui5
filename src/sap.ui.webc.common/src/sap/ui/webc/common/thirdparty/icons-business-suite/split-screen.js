sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/split-screen", "./v2/split-screen"], function (_exports, _Theme, _splitScreen, _splitScreen2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _splitScreen.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _splitScreen.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _splitScreen.pathData : _splitScreen2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/split-screen";
  _exports.default = _default;
});