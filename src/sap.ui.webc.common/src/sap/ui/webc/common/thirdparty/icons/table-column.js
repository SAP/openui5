sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/table-column", "./v5/table-column"], function (_exports, _Theme, _tableColumn, _tableColumn2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tableColumn.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tableColumn.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tableColumn.pathData : _tableColumn2.pathData;
  _exports.pathData = pathData;
  var _default = "table-column";
  _exports.default = _default;
});