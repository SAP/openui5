sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/full-port", "./v3/full-port"], function (_exports, _Theme, _fullPort, _fullPort2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fullPort.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fullPort.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fullPort.pathData : _fullPort2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/full-port";
  _exports.default = _default;
});