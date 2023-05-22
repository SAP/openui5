sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/doc-attachment", "./v5/doc-attachment"], function (_exports, _Theme, _docAttachment, _docAttachment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _docAttachment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _docAttachment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _docAttachment.pathData : _docAttachment2.pathData;
  _exports.pathData = pathData;
  var _default = "doc-attachment";
  _exports.default = _default;
});