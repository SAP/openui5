sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/neutral", "./v2/neutral"], function (_exports, _Theme, _neutral, _neutral2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _neutral.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _neutral.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _neutral.pathData : _neutral2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/neutral";
  _exports.default = _default;
});