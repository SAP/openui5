sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/text-align-justified", "./v5/text-align-justified"], function (_exports, _Theme, _textAlignJustified, _textAlignJustified2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _textAlignJustified.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _textAlignJustified.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _textAlignJustified.pathData : _textAlignJustified2.pathData;
  _exports.pathData = pathData;
  var _default = "text-align-justified";
  _exports.default = _default;
});