sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/box-truck", "./v2/box-truck"], function (_exports, _Theme, _boxTruck, _boxTruck2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boxTruck.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boxTruck.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boxTruck.pathData : _boxTruck2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/box-truck";
  _exports.default = _default;
});