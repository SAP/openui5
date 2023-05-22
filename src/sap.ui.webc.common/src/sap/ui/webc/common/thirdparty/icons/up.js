sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/up", "./v5/up"], function (_exports, _Theme, _up, _up2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _up.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _up.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _up.pathData : _up2.pathData;
  _exports.pathData = pathData;
  var _default = "up";
  _exports.default = _default;
});