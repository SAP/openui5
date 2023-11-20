sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/medicine-inhaler", "./v2/medicine-inhaler"], function (_exports, _Theme, _medicineInhaler, _medicineInhaler2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _medicineInhaler.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _medicineInhaler.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _medicineInhaler.pathData : _medicineInhaler2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/medicine-inhaler";
  _exports.default = _default;
});