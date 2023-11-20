sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/firewall", "./v3/firewall"], function (_exports, _Theme, _firewall, _firewall2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _firewall.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _firewall.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _firewall.pathData : _firewall2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/firewall";
  _exports.default = _default;
});