sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/column-selected", "./v2/column-selected"], function (_exports, _Theme, _columnSelected, _columnSelected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _columnSelected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _columnSelected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _columnSelected.pathData : _columnSelected2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/column-selected";
  _exports.default = _default;
});