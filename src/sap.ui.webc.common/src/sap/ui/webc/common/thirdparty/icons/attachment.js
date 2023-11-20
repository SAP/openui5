sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/attachment", "./v5/attachment"], function (_exports, _Theme, _attachment, _attachment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _attachment.pathData : _attachment2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment";
  _exports.default = _default;
});