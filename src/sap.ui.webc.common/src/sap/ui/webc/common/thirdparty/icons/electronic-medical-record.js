sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/electronic-medical-record", "./v5/electronic-medical-record"], function (_exports, _Theme, _electronicMedicalRecord, _electronicMedicalRecord2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _electronicMedicalRecord.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _electronicMedicalRecord.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _electronicMedicalRecord.pathData : _electronicMedicalRecord2.pathData;
  _exports.pathData = pathData;
  var _default = "electronic-medical-record";
  _exports.default = _default;
});