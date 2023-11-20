sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/decrease-indent", "./v2/decrease-indent"], function (_exports, _Theme, _decreaseIndent, _decreaseIndent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _decreaseIndent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _decreaseIndent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _decreaseIndent.pathData : _decreaseIndent2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/decrease-indent";
  _exports.default = _default;
});