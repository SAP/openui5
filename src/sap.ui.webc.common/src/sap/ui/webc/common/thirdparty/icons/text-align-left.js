sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/text-align-left", "./v5/text-align-left"], function (_exports, _Theme, _textAlignLeft, _textAlignLeft2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _textAlignLeft.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _textAlignLeft.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _textAlignLeft.pathData : _textAlignLeft2.pathData;
  _exports.pathData = pathData;
  var _default = "text-align-left";
  _exports.default = _default;
});