sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sorting-ranking", "./v5/sorting-ranking"], function (_exports, _Theme, _sortingRanking, _sortingRanking2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sortingRanking.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sortingRanking.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sortingRanking.pathData : _sortingRanking2.pathData;
  _exports.pathData = pathData;
  var _default = "sorting-ranking";
  _exports.default = _default;
});