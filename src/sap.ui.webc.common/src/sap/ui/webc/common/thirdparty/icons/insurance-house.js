sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/insurance-house", "./v5/insurance-house"], function (_exports, _Theme, _insuranceHouse, _insuranceHouse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _insuranceHouse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _insuranceHouse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _insuranceHouse.pathData : _insuranceHouse2.pathData;
  _exports.pathData = pathData;
  var _default = "insurance-house";
  _exports.default = _default;
});