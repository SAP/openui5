sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment-text-file", "./v5/attachment-text-file"], function (_exports, _Theme, _attachmentTextFile, _attachmentTextFile2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentTextFile.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentTextFile.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachmentTextFile.pathData : _attachmentTextFile2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-text-file";
  _exports.default = _default;
});