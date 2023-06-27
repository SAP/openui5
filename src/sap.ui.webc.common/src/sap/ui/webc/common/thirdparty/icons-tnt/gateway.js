sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/gateway", "./v3/gateway"], function (_exports, _Theme, _gateway, _gateway2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _gateway.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _gateway.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _gateway.pathData : _gateway2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/gateway";
  _exports.default = _default;
});