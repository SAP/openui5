sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/browse-folder", "./v5/browse-folder"], function (_exports, _Theme, _browseFolder, _browseFolder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _browseFolder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _browseFolder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _browseFolder.pathData : _browseFolder2.pathData;
  _exports.pathData = pathData;
  var _default = "browse-folder";
  _exports.default = _default;
});