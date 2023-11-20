sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/array", "./v3/array"], function (_exports, _Theme, _array, _array2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _array.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _array.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _array.pathData : _array2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/array";
  _exports.default = _default;
});