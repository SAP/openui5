sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/truck-load-unload", "./v2/truck-load-unload"], function (_exports, _Theme, _truckLoadUnload, _truckLoadUnload2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _truckLoadUnload.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _truckLoadUnload.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _truckLoadUnload.pathData : _truckLoadUnload2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/truck-load-unload";
  _exports.default = _default;
});