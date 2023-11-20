sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/signature", "./v5/signature"], function (_exports, _Theme, _signature, _signature2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _signature.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _signature.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _signature.pathData : _signature2.pathData;
  _exports.pathData = pathData;
  var _default = "signature";
  _exports.default = _default;
});