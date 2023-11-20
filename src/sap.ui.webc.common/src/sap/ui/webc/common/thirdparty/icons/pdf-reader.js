sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pdf-reader", "./v5/pdf-reader"], function (_exports, _Theme, _pdfReader, _pdfReader2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pdfReader.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pdfReader.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pdfReader.pathData : _pdfReader2.pathData;
  _exports.pathData = pathData;
  var _default = "pdf-reader";
  _exports.default = _default;
});