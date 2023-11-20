sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/network", "./v3/network"], function (_exports, _Theme, _network, _network2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _network.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _network.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _network.pathData : _network2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/network";
  _exports.default = _default;
});