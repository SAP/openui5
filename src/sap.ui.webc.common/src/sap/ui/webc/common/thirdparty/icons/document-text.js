sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/document-text", "./v5/document-text"], function (_exports, _Theme, _documentText, _documentText2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _documentText.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _documentText.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _documentText.pathData : _documentText2.pathData;
  _exports.pathData = pathData;
  var _default = "document-text";
  _exports.default = _default;
});