sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-astonished", "./v2/face-astonished"], function (_exports, _Theme, _faceAstonished, _faceAstonished2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceAstonished.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceAstonished.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceAstonished.pathData : _faceAstonished2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-astonished";
  _exports.default = _default;
});