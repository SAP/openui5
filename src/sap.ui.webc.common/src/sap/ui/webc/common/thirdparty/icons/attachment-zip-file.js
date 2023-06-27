sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment-zip-file", "./v5/attachment-zip-file"], function (_exports, _Theme, _attachmentZipFile, _attachmentZipFile2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentZipFile.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentZipFile.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachmentZipFile.pathData : _attachmentZipFile2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-zip-file";
  _exports.default = _default;
});