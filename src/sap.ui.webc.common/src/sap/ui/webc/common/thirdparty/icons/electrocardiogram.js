sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/electrocardiogram", "./v5/electrocardiogram"], function (_exports, _Theme, _electrocardiogram, _electrocardiogram2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _electrocardiogram.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _electrocardiogram.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _electrocardiogram.pathData : _electrocardiogram2.pathData;
  _exports.pathData = pathData;
  var _default = "electrocardiogram";
  _exports.default = _default;
});