sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/document-info-recording", "./v3/document-info-recording"], function (_exports, _Theme, _documentInfoRecording, _documentInfoRecording2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _documentInfoRecording.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _documentInfoRecording.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _documentInfoRecording.pathData : _documentInfoRecording2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/document-info-recording";
  _exports.default = _default;
});