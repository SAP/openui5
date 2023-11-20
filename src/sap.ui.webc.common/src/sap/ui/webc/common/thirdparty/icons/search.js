sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/search", "./v5/search"], function (_exports, _Theme, _search, _search2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _search.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _search.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _search.pathData : _search2.pathData;
  _exports.pathData = pathData;
  var _default = "search";
  _exports.default = _default;
});