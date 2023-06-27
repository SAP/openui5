sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bo-strategy-management", "./v5/bo-strategy-management"], function (_exports, _Theme, _boStrategyManagement, _boStrategyManagement2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boStrategyManagement.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boStrategyManagement.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boStrategyManagement.pathData : _boStrategyManagement2.pathData;
  _exports.pathData = pathData;
  var _default = "bo-strategy-management";
  _exports.default = _default;
});