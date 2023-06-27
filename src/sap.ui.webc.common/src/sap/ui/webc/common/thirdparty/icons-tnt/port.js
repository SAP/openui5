sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/port", "./v3/port"], function (_exports, _Theme, _port, _port2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _port.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _port.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _port.pathData : _port2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/port";
  _exports.default = _default;
});