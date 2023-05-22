sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/italic-text", "./v5/italic-text"], function (_exports, _Theme, _italicText, _italicText2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _italicText.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _italicText.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _italicText.pathData : _italicText2.pathData;
  _exports.pathData = pathData;
  var _default = "italic-text";
  _exports.default = _default;
});