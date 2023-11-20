sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/outbound-delivery-inactive", "./v2/outbound-delivery-inactive"], function (_exports, _Theme, _outboundDeliveryInactive, _outboundDeliveryInactive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _outboundDeliveryInactive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _outboundDeliveryInactive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _outboundDeliveryInactive.pathData : _outboundDeliveryInactive2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/outbound-delivery-inactive";
  _exports.default = _default;
});