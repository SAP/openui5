sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/ps-text", "./v2/ps-text"], function (_exports, _Theme, _psText, _psText2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _psText.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _psText.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _psText.pathData : _psText2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/ps-text";
  _exports.default = _default;
});