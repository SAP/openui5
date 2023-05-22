sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sales-document", "./v5/sales-document"], function (_exports, _Theme, _salesDocument, _salesDocument2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _salesDocument.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _salesDocument.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _salesDocument.pathData : _salesDocument2.pathData;
  _exports.pathData = pathData;
  var _default = "sales-document";
  _exports.default = _default;
});