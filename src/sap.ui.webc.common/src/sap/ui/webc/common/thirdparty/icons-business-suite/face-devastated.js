sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-devastated", "./v2/face-devastated"], function (_exports, _Theme, _faceDevastated, _faceDevastated2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceDevastated.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceDevastated.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceDevastated.pathData : _faceDevastated2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-devastated";
  _exports.default = _default;
});