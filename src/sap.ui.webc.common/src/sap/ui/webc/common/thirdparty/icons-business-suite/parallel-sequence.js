sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/parallel-sequence", "./v2/parallel-sequence"], function (_exports, _Theme, _parallelSequence, _parallelSequence2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _parallelSequence.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _parallelSequence.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _parallelSequence.pathData : _parallelSequence2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/parallel-sequence";
  _exports.default = _default;
});