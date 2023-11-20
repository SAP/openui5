sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/operations", "./v3/operations"], function (_exports, _Theme, _operations, _operations2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _operations.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _operations.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _operations.pathData : _operations2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/operations";
  _exports.default = _default;
});