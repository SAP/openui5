sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/ppt-attachment", "./v5/ppt-attachment"], function (_exports, _Theme, _pptAttachment, _pptAttachment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pptAttachment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pptAttachment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pptAttachment.pathData : _pptAttachment2.pathData;
  _exports.pathData = pathData;
  var _default = "ppt-attachment";
  _exports.default = _default;
});