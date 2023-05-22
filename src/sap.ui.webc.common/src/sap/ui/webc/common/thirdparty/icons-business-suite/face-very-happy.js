sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-very-happy", "./v2/face-very-happy"], function (_exports, _Theme, _faceVeryHappy, _faceVeryHappy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceVeryHappy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceVeryHappy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceVeryHappy.pathData : _faceVeryHappy2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-very-happy";
  _exports.default = _default;
});