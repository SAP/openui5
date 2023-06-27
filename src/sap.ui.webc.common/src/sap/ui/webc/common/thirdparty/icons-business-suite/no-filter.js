sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/no-filter", "./v2/no-filter"], function (_exports, _Theme, _noFilter, _noFilter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _noFilter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _noFilter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _noFilter.pathData : _noFilter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/no-filter";
  _exports.default = _default;
});