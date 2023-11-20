sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/row-unselected", "./v2/row-unselected"], function (_exports, _Theme, _rowUnselected, _rowUnselected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _rowUnselected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _rowUnselected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _rowUnselected.pathData : _rowUnselected2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/row-unselected";
  _exports.default = _default;
});