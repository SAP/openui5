sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vehicle-repair", "./v5/vehicle-repair"], function (_exports, _Theme, _vehicleRepair, _vehicleRepair2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _vehicleRepair.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _vehicleRepair.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _vehicleRepair.pathData : _vehicleRepair2.pathData;
  _exports.pathData = pathData;
  var _default = "vehicle-repair";
  _exports.default = _default;
});