sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/row-selected", "./v2/row-selected"], function (_exports, _Theme, _rowSelected, _rowSelected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _rowSelected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _rowSelected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _rowSelected.pathData : _rowSelected2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/row-selected";
  _exports.default = _default;
});