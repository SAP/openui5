sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/outbound-delivery-active", "./v2/outbound-delivery-active"], function (_exports, _Theme, _outboundDeliveryActive, _outboundDeliveryActive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _outboundDeliveryActive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _outboundDeliveryActive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _outboundDeliveryActive.pathData : _outboundDeliveryActive2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/outbound-delivery-active";
  _exports.default = _default;
});