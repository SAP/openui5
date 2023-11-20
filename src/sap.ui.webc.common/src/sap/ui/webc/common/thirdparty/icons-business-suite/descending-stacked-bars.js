sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/descending-stacked-bars", "./v2/descending-stacked-bars"], function (_exports, _Theme, _descendingStackedBars, _descendingStackedBars2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _descendingStackedBars.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _descendingStackedBars.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _descendingStackedBars.pathData : _descendingStackedBars2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/descending-stacked-bars";
  _exports.default = _default;
});