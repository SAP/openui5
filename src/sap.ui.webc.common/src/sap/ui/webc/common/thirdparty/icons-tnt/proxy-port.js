sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/proxy-port", "./v3/proxy-port"], function (_exports, _Theme, _proxyPort, _proxyPort2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _proxyPort.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _proxyPort.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _proxyPort.pathData : _proxyPort2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/proxy-port";
  _exports.default = _default;
});