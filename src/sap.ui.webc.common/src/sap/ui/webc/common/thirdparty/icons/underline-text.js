sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/underline-text", "./v5/underline-text"], function (_exports, _Theme, _underlineText, _underlineText2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _underlineText.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _underlineText.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _underlineText.pathData : _underlineText2.pathData;
  _exports.pathData = pathData;
  var _default = "underline-text";
  _exports.default = _default;
});