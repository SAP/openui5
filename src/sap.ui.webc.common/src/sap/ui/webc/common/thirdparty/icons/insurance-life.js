sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/insurance-life", "./v5/insurance-life"], function (_exports, _Theme, _insuranceLife, _insuranceLife2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _insuranceLife.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _insuranceLife.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _insuranceLife.pathData : _insuranceLife2.pathData;
  _exports.pathData = pathData;
  var _default = "insurance-life";
  _exports.default = _default;
});