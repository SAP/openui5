sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-very-bad", "./v2/face-very-bad"], function (_exports, _Theme, _faceVeryBad, _faceVeryBad2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceVeryBad.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceVeryBad.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceVeryBad.pathData : _faceVeryBad2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-very-bad";
  _exports.default = _default;
});