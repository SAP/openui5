sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/shipping-status", "./v5/shipping-status"], function (_exports, _Theme, _shippingStatus, _shippingStatus2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _shippingStatus.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _shippingStatus.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _shippingStatus.pathData : _shippingStatus2.pathData;
  _exports.pathData = pathData;
  var _default = "shipping-status";
  _exports.default = _default;
});