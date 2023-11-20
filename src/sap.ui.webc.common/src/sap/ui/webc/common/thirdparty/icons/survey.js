sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/survey", "./v5/survey"], function (_exports, _Theme, _survey, _survey2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _survey.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _survey.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _survey.pathData : _survey2.pathData;
  _exports.pathData = pathData;
  var _default = "survey";
  _exports.default = _default;
});