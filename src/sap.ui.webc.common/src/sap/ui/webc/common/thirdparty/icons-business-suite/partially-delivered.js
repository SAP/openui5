sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/partially-delivered", "./v2/partially-delivered"], function (_exports, _Theme, _partiallyDelivered, _partiallyDelivered2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _partiallyDelivered.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _partiallyDelivered.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _partiallyDelivered.pathData : _partiallyDelivered2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/partially-delivered";
  _exports.default = _default;
});