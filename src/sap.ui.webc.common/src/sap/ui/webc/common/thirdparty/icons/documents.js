sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/documents", "./v5/documents"], function (_exports, _Theme, _documents, _documents2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _documents.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _documents.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _documents.pathData : _documents2.pathData;
  _exports.pathData = pathData;
  var _default = "documents";
  _exports.default = _default;
});