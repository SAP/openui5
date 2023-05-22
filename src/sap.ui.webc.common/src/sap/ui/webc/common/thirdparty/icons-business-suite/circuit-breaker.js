sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/circuit-breaker", "./v2/circuit-breaker"], function (_exports, _Theme, _circuitBreaker, _circuitBreaker2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _circuitBreaker.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _circuitBreaker.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _circuitBreaker.pathData : _circuitBreaker2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/circuit-breaker";
  _exports.default = _default;
});