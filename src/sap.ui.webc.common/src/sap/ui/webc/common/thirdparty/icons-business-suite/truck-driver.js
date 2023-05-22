sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/truck-driver", "./v2/truck-driver"], function (_exports, _Theme, _truckDriver, _truckDriver2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _truckDriver.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _truckDriver.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _truckDriver.pathData : _truckDriver2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/truck-driver";
  _exports.default = _default;
});