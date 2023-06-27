sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/document", "./v5/document"], function (_exports, _Theme, _document, _document2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _document.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _document.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _document.pathData : _document2.pathData;
  _exports.pathData = pathData;
  var _default = "document";
  _exports.default = _default;
});