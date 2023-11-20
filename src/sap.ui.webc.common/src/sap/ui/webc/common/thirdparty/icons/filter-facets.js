sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/filter-facets", "./v5/filter-facets"], function (_exports, _Theme, _filterFacets, _filterFacets2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _filterFacets.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _filterFacets.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _filterFacets.pathData : _filterFacets2.pathData;
  _exports.pathData = pathData;
  var _default = "filter-facets";
  _exports.default = _default;
});