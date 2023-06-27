sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment-photo", "./v5/attachment-photo"], function (_exports, _Theme, _attachmentPhoto, _attachmentPhoto2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentPhoto.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentPhoto.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachmentPhoto.pathData : _attachmentPhoto2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-photo";
  _exports.default = _default;
});