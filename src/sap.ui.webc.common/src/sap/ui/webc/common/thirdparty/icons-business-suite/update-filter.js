sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/update-filter", "./v2/update-filter"], function (_exports, _Theme, _updateFilter, _updateFilter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _updateFilter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _updateFilter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _updateFilter.pathData : _updateFilter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/update-filter";
  _exports.default = _default;
});