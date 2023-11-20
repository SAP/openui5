sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/text-formatting", "./v5/text-formatting"], function (_exports, _Theme, _textFormatting, _textFormatting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _textFormatting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _textFormatting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _textFormatting.pathData : _textFormatting2.pathData;
  _exports.pathData = pathData;
  var _default = "text-formatting";
  _exports.default = _default;
});