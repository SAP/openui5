sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/compare-2", "./v5/compare-2"], function (_exports, _Theme, _compare, _compare2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _compare.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _compare.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _compare.pathData : _compare2.pathData;
  _exports.pathData = pathData;
  var _default = "compare-2";
  _exports.default = _default;
});