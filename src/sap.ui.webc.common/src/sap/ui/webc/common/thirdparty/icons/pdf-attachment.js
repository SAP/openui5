sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pdf-attachment", "./v5/pdf-attachment"], function (_exports, _Theme, _pdfAttachment, _pdfAttachment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pdfAttachment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pdfAttachment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pdfAttachment.pathData : _pdfAttachment2.pathData;
  _exports.pathData = pathData;
  var _default = "pdf-attachment";
  _exports.default = _default;
});