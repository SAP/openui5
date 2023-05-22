sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/non-binary", "./v5/non-binary"], function (_exports, _Theme, _nonBinary, _nonBinary2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _nonBinary.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _nonBinary.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _nonBinary.pathData : _nonBinary2.pathData;
  _exports.pathData = pathData;
  var _default = "non-binary";
  _exports.default = _default;
});