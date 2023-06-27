sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bold-text", "./v5/bold-text"], function (_exports, _Theme, _boldText, _boldText2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boldText.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boldText.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boldText.pathData : _boldText2.pathData;
  _exports.pathData = pathData;
  var _default = "bold-text";
  _exports.default = _default;
});