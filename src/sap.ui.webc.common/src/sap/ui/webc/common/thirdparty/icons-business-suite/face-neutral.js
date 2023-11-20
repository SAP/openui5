sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-neutral", "./v2/face-neutral"], function (_exports, _Theme, _faceNeutral, _faceNeutral2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceNeutral.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceNeutral.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceNeutral.pathData : _faceNeutral2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-neutral";
  _exports.default = _default;
});