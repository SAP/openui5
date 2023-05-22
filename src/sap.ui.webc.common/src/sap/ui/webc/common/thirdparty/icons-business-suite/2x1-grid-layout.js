sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/2x1-grid-layout", "./v2/2x1-grid-layout"], function (_exports, _Theme, _x1GridLayout, _x1GridLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _x1GridLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _x1GridLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _x1GridLayout.pathData : _x1GridLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/2x1-grid-layout";
  _exports.default = _default;
});