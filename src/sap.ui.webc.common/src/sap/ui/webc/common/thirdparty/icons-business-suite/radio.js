sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/radio", "./v2/radio"], function (_exports, _Theme, _radio, _radio2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _radio.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _radio.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _radio.pathData : _radio2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/radio";
  _exports.default = _default;
});