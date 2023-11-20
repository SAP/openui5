sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/remove-total", "./v2/remove-total"], function (_exports, _Theme, _removeTotal, _removeTotal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _removeTotal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _removeTotal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _removeTotal.pathData : _removeTotal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/remove-total";
  _exports.default = _default;
});