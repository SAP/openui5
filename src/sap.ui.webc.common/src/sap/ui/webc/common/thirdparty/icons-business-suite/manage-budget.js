sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/manage-budget", "./v2/manage-budget"], function (_exports, _Theme, _manageBudget, _manageBudget2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _manageBudget.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _manageBudget.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _manageBudget.pathData : _manageBudget2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/manage-budget";
  _exports.default = _default;
});