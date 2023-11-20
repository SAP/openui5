sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sort-ascending", "./v5/sort-ascending"], function (_exports, _Theme, _sortAscending, _sortAscending2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sortAscending.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sortAscending.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sortAscending.pathData : _sortAscending2.pathData;
  _exports.pathData = pathData;
  var _default = "sort-ascending";
  _exports.default = _default;
});