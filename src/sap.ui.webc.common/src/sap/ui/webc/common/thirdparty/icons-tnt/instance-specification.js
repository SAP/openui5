sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/instance-specification", "./v3/instance-specification"], function (_exports, _Theme, _instanceSpecification, _instanceSpecification2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _instanceSpecification.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _instanceSpecification.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _instanceSpecification.pathData : _instanceSpecification2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/instance-specification";
  _exports.default = _default;
});