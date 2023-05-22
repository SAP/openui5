sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment-html", "./v5/attachment-html"], function (_exports, _Theme, _attachmentHtml, _attachmentHtml2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentHtml.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentHtml.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachmentHtml.pathData : _attachmentHtml2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-html";
  _exports.default = _default;
});