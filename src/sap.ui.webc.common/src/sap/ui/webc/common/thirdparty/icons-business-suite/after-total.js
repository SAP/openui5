sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/after-total", "./v2/after-total"], function (_exports, _Theme, _afterTotal, _afterTotal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _afterTotal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _afterTotal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _afterTotal.pathData : _afterTotal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/after-total";
  _exports.default = _default;
});