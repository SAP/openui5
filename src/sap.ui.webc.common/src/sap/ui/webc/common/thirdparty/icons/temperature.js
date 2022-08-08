sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/temperature", "./v4/temperature"], function (_exports, _Theme, _temperature, _temperature2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _temperature.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _temperature.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _temperature.pathData : _temperature2.pathData;
  _exports.pathData = pathData;
  var _default = "temperature";
  _exports.default = _default;
});