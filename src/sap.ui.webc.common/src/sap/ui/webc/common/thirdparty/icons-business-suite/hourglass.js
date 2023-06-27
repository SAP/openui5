sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/hourglass", "./v2/hourglass"], function (_exports, _Theme, _hourglass, _hourglass2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _hourglass.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _hourglass.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _hourglass.pathData : _hourglass2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/hourglass";
  _exports.default = _default;
});