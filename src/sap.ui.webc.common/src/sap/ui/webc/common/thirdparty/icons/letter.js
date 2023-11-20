sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/letter", "./v5/letter"], function (_exports, _Theme, _letter, _letter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _letter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _letter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _letter.pathData : _letter2.pathData;
  _exports.pathData = pathData;
  var _default = "letter";
  _exports.default = _default;
});