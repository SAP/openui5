sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-skeptical", "./v2/face-skeptical"], function (_exports, _Theme, _faceSkeptical, _faceSkeptical2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceSkeptical.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceSkeptical.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceSkeptical.pathData : _faceSkeptical2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-skeptical";
  _exports.default = _default;
});