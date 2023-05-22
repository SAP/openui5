sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/return-delivery", "./v2/return-delivery"], function (_exports, _Theme, _returnDelivery, _returnDelivery2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _returnDelivery.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _returnDelivery.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _returnDelivery.pathData : _returnDelivery2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/return-delivery";
  _exports.default = _default;
});