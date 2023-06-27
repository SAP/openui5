sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/return-order", "./v2/return-order"], function (_exports, _Theme, _returnOrder, _returnOrder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _returnOrder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _returnOrder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _returnOrder.pathData : _returnOrder2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/return-order";
  _exports.default = _default;
});