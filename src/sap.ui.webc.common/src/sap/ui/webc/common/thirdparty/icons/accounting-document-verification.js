sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/accounting-document-verification", "./v5/accounting-document-verification"], function (_exports, _Theme, _accountingDocumentVerification, _accountingDocumentVerification2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _accountingDocumentVerification.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _accountingDocumentVerification.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _accountingDocumentVerification.pathData : _accountingDocumentVerification2.pathData;
  _exports.pathData = pathData;
  var _default = "accounting-document-verification";
  _exports.default = _default;
});