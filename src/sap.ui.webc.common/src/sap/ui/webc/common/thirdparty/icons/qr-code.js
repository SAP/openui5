sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/qr-code", "./v5/qr-code"], function (_exports, _Theme, _qrCode, _qrCode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _qrCode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _qrCode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _qrCode.pathData : _qrCode2.pathData;
  _exports.pathData = pathData;
  var _default = "qr-code";
  _exports.default = _default;
});