sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/manage-charging-stations", "./v2/manage-charging-stations"], function (_exports, _Theme, _manageChargingStations, _manageChargingStations2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _manageChargingStations.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _manageChargingStations.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _manageChargingStations.pathData : _manageChargingStations2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/manage-charging-stations";
  _exports.default = _default;
});