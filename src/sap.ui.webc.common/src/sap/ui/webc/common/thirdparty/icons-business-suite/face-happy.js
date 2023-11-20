sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-happy", "./v2/face-happy"], function (_exports, _Theme, _faceHappy, _faceHappy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceHappy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceHappy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceHappy.pathData : _faceHappy2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-happy";
  _exports.default = _default;
});