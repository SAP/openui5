sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/mobile-network", "./v3/mobile-network"], function (_exports, _Theme, _mobileNetwork, _mobileNetwork2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mobileNetwork.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mobileNetwork.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mobileNetwork.pathData : _mobileNetwork2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/mobile-network";
  _exports.default = _default;
});