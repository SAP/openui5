sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/partially-fixed-cell", "./v2/partially-fixed-cell"], function (_exports, _Theme, _partiallyFixedCell, _partiallyFixedCell2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _partiallyFixedCell.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _partiallyFixedCell.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _partiallyFixedCell.pathData : _partiallyFixedCell2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/partially-fixed-cell";
  _exports.default = _default;
});