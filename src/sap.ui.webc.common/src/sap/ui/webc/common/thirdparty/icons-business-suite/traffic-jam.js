sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/traffic-jam", "./v2/traffic-jam"], function (_exports, _Theme, _trafficJam, _trafficJam2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trafficJam.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trafficJam.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _trafficJam.pathData : _trafficJam2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/traffic-jam";
  _exports.default = _default;
});