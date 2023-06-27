sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/connected", "./v5/connected"], function (_exports, _Theme, _connected, _connected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _connected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _connected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _connected.pathData : _connected2.pathData;
  _exports.pathData = pathData;
  var _default = "connected";
  _exports.default = _default;
});