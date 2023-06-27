sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/hint", "./v5/hint"], function (_exports, _Theme, _hint, _hint2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _hint.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _hint.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _hint.pathData : _hint2.pathData;
  _exports.pathData = pathData;
  var _default = "hint";
  _exports.default = _default;
});