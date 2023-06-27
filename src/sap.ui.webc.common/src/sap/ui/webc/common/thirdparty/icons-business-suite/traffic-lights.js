sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/traffic-lights", "./v2/traffic-lights"], function (_exports, _Theme, _trafficLights, _trafficLights2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trafficLights.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trafficLights.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _trafficLights.pathData : _trafficLights2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/traffic-lights";
  _exports.default = _default;
});