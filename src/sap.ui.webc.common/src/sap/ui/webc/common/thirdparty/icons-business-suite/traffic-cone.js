sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/traffic-cone", "./v2/traffic-cone"], function (_exports, _Theme, _trafficCone, _trafficCone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trafficCone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trafficCone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _trafficCone.pathData : _trafficCone2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/traffic-cone";
  _exports.default = _default;
});