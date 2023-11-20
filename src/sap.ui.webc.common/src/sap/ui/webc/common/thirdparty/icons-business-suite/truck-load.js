sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/truck-load", "./v2/truck-load"], function (_exports, _Theme, _truckLoad, _truckLoad2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _truckLoad.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _truckLoad.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _truckLoad.pathData : _truckLoad2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/truck-load";
  _exports.default = _default;
});