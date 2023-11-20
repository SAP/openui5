sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/folder-full", "./v5/folder-full"], function (_exports, _Theme, _folderFull, _folderFull2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _folderFull.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _folderFull.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _folderFull.pathData : _folderFull2.pathData;
  _exports.pathData = pathData;
  var _default = "folder-full";
  _exports.default = _default;
});