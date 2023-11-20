sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/medicine-drops", "./v2/medicine-drops"], function (_exports, _Theme, _medicineDrops, _medicineDrops2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _medicineDrops.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _medicineDrops.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _medicineDrops.pathData : _medicineDrops2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/medicine-drops";
  _exports.default = _default;
});