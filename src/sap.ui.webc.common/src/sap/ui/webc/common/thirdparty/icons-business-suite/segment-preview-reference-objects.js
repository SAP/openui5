sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/segment-preview-reference-objects", "./v2/segment-preview-reference-objects"], function (_exports, _Theme, _segmentPreviewReferenceObjects, _segmentPreviewReferenceObjects2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _segmentPreviewReferenceObjects.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _segmentPreviewReferenceObjects.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _segmentPreviewReferenceObjects.pathData : _segmentPreviewReferenceObjects2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/segment-preview-reference-objects";
  _exports.default = _default;
});