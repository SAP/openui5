sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/fixed-cell", "./v2/fixed-cell"], function (_exports, _Theme, _fixedCell, _fixedCell2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fixedCell.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fixedCell.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fixedCell.pathData : _fixedCell2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/fixed-cell";
  _exports.default = _default;
});