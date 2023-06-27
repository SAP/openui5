sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sort-descending", "./v5/sort-descending"], function (_exports, _Theme, _sortDescending, _sortDescending2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sortDescending.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sortDescending.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sortDescending.pathData : _sortDescending2.pathData;
  _exports.pathData = pathData;
  var _default = "sort-descending";
  _exports.default = _default;
});