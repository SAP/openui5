sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/box-truck-empty", "./v2/box-truck-empty"], function (_exports, _Theme, _boxTruckEmpty, _boxTruckEmpty2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boxTruckEmpty.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boxTruckEmpty.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boxTruckEmpty.pathData : _boxTruckEmpty2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/box-truck-empty";
  _exports.default = _default;
});