sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/medicine-ointment", "./v2/medicine-ointment"], function (_exports, _Theme, _medicineOintment, _medicineOintment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _medicineOintment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _medicineOintment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _medicineOintment.pathData : _medicineOintment2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/medicine-ointment";
  _exports.default = _default;
});