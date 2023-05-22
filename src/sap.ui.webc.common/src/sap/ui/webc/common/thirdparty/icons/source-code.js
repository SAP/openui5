sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/source-code", "./v5/source-code"], function (_exports, _Theme, _sourceCode, _sourceCode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sourceCode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sourceCode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sourceCode.pathData : _sourceCode2.pathData;
  _exports.pathData = pathData;
  var _default = "source-code";
  _exports.default = _default;
});