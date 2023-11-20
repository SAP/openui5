sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/fx", "./v5/fx"], function (_exports, _Theme, _fx, _fx2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fx.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fx.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fx.pathData : _fx2.pathData;
  _exports.pathData = pathData;
  var _default = "fx";
  _exports.default = _default;
});