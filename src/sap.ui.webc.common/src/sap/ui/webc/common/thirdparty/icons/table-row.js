sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/table-row", "./v5/table-row"], function (_exports, _Theme, _tableRow, _tableRow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tableRow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tableRow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tableRow.pathData : _tableRow2.pathData;
  _exports.pathData = pathData;
  var _default = "table-row";
  _exports.default = _default;
});