sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/contract", "./v2/contract"], function (_exports, _Theme, _contract, _contract2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _contract.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _contract.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _contract.pathData : _contract2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/contract";
  _exports.default = _default;
});