sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/movement-warning", "./v2/movement-warning"], function (_exports, _Theme, _movementWarning, _movementWarning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _movementWarning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _movementWarning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _movementWarning.pathData : _movementWarning2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/movement-warning";
  _exports.default = _default;
});