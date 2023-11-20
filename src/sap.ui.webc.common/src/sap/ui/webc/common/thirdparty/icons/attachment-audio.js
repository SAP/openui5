sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment-audio", "./v5/attachment-audio"], function (_exports, _Theme, _attachmentAudio, _attachmentAudio2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentAudio.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentAudio.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachmentAudio.pathData : _attachmentAudio2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-audio";
  _exports.default = _default;
});