sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/parallel-gateway", "./v3/parallel-gateway"], function (_exports, _Theme, _parallelGateway, _parallelGateway2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _parallelGateway.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _parallelGateway.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _parallelGateway.pathData : _parallelGateway2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/parallel-gateway";
  _exports.default = _default;
});