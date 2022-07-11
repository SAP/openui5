sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/table-row", "./v4/table-row"], function (_exports, _Theme, _tableRow, _tableRow2) {
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
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _tableRow.pathData : _tableRow2.pathData;
  _exports.pathData = pathData;
  var _default = "table-row";
  _exports.default = _default;
});