sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/driver-warning", "./v2/driver-warning"], function (_exports, _Theme, _driverWarning, _driverWarning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _driverWarning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _driverWarning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _driverWarning.pathData : _driverWarning2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/driver-warning";
  _exports.default = _default;
});