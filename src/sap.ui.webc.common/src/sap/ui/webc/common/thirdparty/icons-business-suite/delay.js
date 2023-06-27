sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/delay", "./v2/delay"], function (_exports, _Theme, _delay, _delay2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _delay.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _delay.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _delay.pathData : _delay2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/delay";
  _exports.default = _default;
});