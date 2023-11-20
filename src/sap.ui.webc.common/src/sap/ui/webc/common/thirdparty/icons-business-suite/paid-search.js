sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/paid-search", "./v2/paid-search"], function (_exports, _Theme, _paidSearch, _paidSearch2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paidSearch.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paidSearch.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paidSearch.pathData : _paidSearch2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/paid-search";
  _exports.default = _default;
});