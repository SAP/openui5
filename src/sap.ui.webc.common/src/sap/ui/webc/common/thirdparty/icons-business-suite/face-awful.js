sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-awful", "./v2/face-awful"], function (_exports, _Theme, _faceAwful, _faceAwful2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceAwful.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceAwful.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceAwful.pathData : _faceAwful2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-awful";
  _exports.default = _default;
});