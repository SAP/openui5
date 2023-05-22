sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/rotate", "./v5/rotate"], function (_exports, _Theme, _rotate, _rotate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _rotate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _rotate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _rotate.pathData : _rotate2.pathData;
  _exports.pathData = pathData;
  var _default = "rotate";
  _exports.default = _default;
});