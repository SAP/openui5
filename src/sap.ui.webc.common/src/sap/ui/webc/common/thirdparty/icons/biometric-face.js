sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/biometric-face", "./v5/biometric-face"], function (_exports, _Theme, _biometricFace, _biometricFace2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _biometricFace.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _biometricFace.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _biometricFace.pathData : _biometricFace2.pathData;
  _exports.pathData = pathData;
  var _default = "biometric-face";
  _exports.default = _default;
});