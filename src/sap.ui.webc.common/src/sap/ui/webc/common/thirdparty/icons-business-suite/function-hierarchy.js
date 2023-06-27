sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/function-hierarchy", "./v2/function-hierarchy"], function (_exports, _Theme, _functionHierarchy, _functionHierarchy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _functionHierarchy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _functionHierarchy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _functionHierarchy.pathData : _functionHierarchy2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/function-hierarchy";
  _exports.default = _default;
});