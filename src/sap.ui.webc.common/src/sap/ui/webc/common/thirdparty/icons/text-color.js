sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/text-color", "./v5/text-color"], function (_exports, _Theme, _textColor, _textColor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _textColor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _textColor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _textColor.pathData : _textColor2.pathData;
  _exports.pathData = pathData;
  var _default = "text-color";
  _exports.default = _default;
});