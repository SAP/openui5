sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/negative", "./v5/negative"], function (_exports, _Theme, _negative, _negative2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _negative.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _negative.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _negative.pathData : _negative2.pathData;
  _exports.pathData = pathData;
  var _default = "negative";
  _exports.default = _default;
});