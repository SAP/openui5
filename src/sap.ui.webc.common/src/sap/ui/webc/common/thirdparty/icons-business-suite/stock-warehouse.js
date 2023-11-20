sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/stock-warehouse", "./v2/stock-warehouse"], function (_exports, _Theme, _stockWarehouse, _stockWarehouse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _stockWarehouse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _stockWarehouse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _stockWarehouse.pathData : _stockWarehouse2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/stock-warehouse";
  _exports.default = _default;
});