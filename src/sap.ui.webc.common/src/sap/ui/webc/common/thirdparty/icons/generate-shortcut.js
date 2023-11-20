sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/generate-shortcut", "./v5/generate-shortcut"], function (_exports, _Theme, _generateShortcut, _generateShortcut2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _generateShortcut.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _generateShortcut.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _generateShortcut.pathData : _generateShortcut2.pathData;
  _exports.pathData = pathData;
  var _default = "generate-shortcut";
  _exports.default = _default;
});