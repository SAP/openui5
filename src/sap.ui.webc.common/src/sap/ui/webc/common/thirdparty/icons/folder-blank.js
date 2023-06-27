sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/folder-blank", "./v5/folder-blank"], function (_exports, _Theme, _folderBlank, _folderBlank2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _folderBlank.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _folderBlank.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _folderBlank.pathData : _folderBlank2.pathData;
  _exports.pathData = pathData;
  var _default = "folder-blank";
  _exports.default = _default;
});