sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/learning-assistant", "./v5/learning-assistant"], function (_exports, _Theme, _learningAssistant, _learningAssistant2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _learningAssistant.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _learningAssistant.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _learningAssistant.pathData : _learningAssistant2.pathData;
  _exports.pathData = pathData;
  var _default = "learning-assistant";
  _exports.default = _default;
});