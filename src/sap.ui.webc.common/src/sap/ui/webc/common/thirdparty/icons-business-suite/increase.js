sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/increase", "./v2/increase"], function (_exports, _Theme, _increase, _increase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _increase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _increase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _increase.pathData : _increase2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/increase";
  _exports.default = _default;
});