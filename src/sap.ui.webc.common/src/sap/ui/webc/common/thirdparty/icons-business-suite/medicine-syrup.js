sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/medicine-syrup", "./v2/medicine-syrup"], function (_exports, _Theme, _medicineSyrup, _medicineSyrup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _medicineSyrup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _medicineSyrup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _medicineSyrup.pathData : _medicineSyrup2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/medicine-syrup";
  _exports.default = _default;
});