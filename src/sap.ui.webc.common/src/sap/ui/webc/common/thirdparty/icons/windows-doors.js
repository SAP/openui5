sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/windows-doors", "./v5/windows-doors"], function (_exports, _Theme, _windowsDoors, _windowsDoors2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _windowsDoors.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _windowsDoors.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _windowsDoors.pathData : _windowsDoors2.pathData;
  _exports.pathData = pathData;
  var _default = "windows-doors";
  _exports.default = _default;
});