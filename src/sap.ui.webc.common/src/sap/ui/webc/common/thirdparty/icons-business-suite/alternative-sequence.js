sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/alternative-sequence", "./v2/alternative-sequence"], function (_exports, _Theme, _alternativeSequence, _alternativeSequence2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alternativeSequence.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alternativeSequence.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _alternativeSequence.pathData : _alternativeSequence2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/alternative-sequence";
  _exports.default = _default;
});