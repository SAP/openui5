sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/add-filter", "./v5/add-filter"], function (_exports, _Theme, _addFilter, _addFilter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addFilter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addFilter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addFilter.pathData : _addFilter2.pathData;
  _exports.pathData = pathData;
  var _default = "add-filter";
  _exports.default = _default;
});