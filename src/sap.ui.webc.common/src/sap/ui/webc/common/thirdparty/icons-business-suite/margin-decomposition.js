sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/margin-decomposition", "./v2/margin-decomposition"], function (_exports, _Theme, _marginDecomposition, _marginDecomposition2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _marginDecomposition.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _marginDecomposition.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _marginDecomposition.pathData : _marginDecomposition2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/margin-decomposition";
  _exports.default = _default;
});