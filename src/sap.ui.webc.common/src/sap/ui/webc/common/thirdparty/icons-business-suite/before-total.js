sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/before-total", "./v2/before-total"], function (_exports, _Theme, _beforeTotal, _beforeTotal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _beforeTotal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _beforeTotal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _beforeTotal.pathData : _beforeTotal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/before-total";
  _exports.default = _default;
});