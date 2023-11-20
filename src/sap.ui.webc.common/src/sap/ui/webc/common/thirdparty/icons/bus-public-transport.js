sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bus-public-transport", "./v5/bus-public-transport"], function (_exports, _Theme, _busPublicTransport, _busPublicTransport2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _busPublicTransport.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _busPublicTransport.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _busPublicTransport.pathData : _busPublicTransport2.pathData;
  _exports.pathData = pathData;
  var _default = "bus-public-transport";
  _exports.default = _default;
});