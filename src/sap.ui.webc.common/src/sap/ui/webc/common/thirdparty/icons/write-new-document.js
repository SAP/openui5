sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/write-new-document", "./v5/write-new-document"], function (_exports, _Theme, _writeNewDocument, _writeNewDocument2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _writeNewDocument.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _writeNewDocument.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _writeNewDocument.pathData : _writeNewDocument2.pathData;
  _exports.pathData = pathData;
  var _default = "write-new-document";
  _exports.default = _default;
});