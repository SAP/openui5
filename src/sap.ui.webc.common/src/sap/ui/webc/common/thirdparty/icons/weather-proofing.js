sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/weather-proofing", "./v5/weather-proofing"], function (_exports, _Theme, _weatherProofing, _weatherProofing2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _weatherProofing.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _weatherProofing.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _weatherProofing.pathData : _weatherProofing2.pathData;
  _exports.pathData = pathData;
  var _default = "weather-proofing";
  _exports.default = _default;
});