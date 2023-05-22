sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/biometric-thumb", "./v5/biometric-thumb"], function (_exports, _Theme, _biometricThumb, _biometricThumb2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _biometricThumb.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _biometricThumb.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _biometricThumb.pathData : _biometricThumb2.pathData;
  _exports.pathData = pathData;
  var _default = "biometric-thumb";
  _exports.default = _default;
});