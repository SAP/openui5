sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/touch", "./v4/touch"], function (_exports, _Theme, _touch, _touch2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _touch.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _touch.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _touch.pathData : _touch2.pathData;
  _exports.pathData = pathData;
  var _default = "touch";
  _exports.default = _default;
});