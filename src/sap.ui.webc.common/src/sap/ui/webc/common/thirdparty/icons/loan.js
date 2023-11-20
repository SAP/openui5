sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/loan", "./v5/loan"], function (_exports, _Theme, _loan, _loan2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _loan.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _loan.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _loan.pathData : _loan2.pathData;
  _exports.pathData = pathData;
  var _default = "loan";
  _exports.default = _default;
});