sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/unlocked", "./v4/unlocked"], function (_exports, _Theme, _unlocked, _unlocked2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _unlocked.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _unlocked.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _unlocked.pathData : _unlocked2.pathData;
  _exports.pathData = pathData;
  var _default = "unlocked";
  _exports.default = _default;
});