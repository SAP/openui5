sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/question-mark", "./v5/question-mark"], function (_exports, _Theme, _questionMark, _questionMark2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _questionMark.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _questionMark.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _questionMark.pathData : _questionMark2.pathData;
  _exports.pathData = pathData;
  var _default = "question-mark";
  _exports.default = _default;
});