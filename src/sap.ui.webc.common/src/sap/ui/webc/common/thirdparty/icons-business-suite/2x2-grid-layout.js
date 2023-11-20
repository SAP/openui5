sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/2x2-grid-layout", "./v2/2x2-grid-layout"], function (_exports, _Theme, _x2GridLayout, _x2GridLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _x2GridLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _x2GridLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _x2GridLayout.pathData : _x2GridLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/2x2-grid-layout";
  _exports.default = _default;
});