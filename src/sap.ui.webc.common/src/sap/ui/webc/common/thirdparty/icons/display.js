sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/display", "./v5/display"], function (_exports, _Theme, _display, _display2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _display.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _display.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _display.pathData : _display2.pathData;
  _exports.pathData = pathData;
  var _default = "display";
  _exports.default = _default;
});