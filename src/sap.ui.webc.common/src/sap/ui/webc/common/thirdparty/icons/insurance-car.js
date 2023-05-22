sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/insurance-car", "./v5/insurance-car"], function (_exports, _Theme, _insuranceCar, _insuranceCar2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _insuranceCar.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _insuranceCar.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _insuranceCar.pathData : _insuranceCar2.pathData;
  _exports.pathData = pathData;
  var _default = "insurance-car";
  _exports.default = _default;
});