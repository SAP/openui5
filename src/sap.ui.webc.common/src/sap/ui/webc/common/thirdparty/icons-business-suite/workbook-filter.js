sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/workbook-filter", "./v2/workbook-filter"], function (_exports, _Theme, _workbookFilter, _workbookFilter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _workbookFilter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _workbookFilter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _workbookFilter.pathData : _workbookFilter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/workbook-filter";
  _exports.default = _default;
});