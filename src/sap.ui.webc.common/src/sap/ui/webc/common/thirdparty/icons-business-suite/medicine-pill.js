sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/medicine-pill", "./v2/medicine-pill"], function (_exports, _Theme, _medicinePill, _medicinePill2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _medicinePill.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _medicinePill.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _medicinePill.pathData : _medicinePill2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/medicine-pill";
  _exports.default = _default;
});