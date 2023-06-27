sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/down", "./v5/down"], function (_exports, _Theme, _down, _down2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _down.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _down.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _down.pathData : _down2.pathData;
  _exports.pathData = pathData;
  var _default = "down";
  _exports.default = _default;
});