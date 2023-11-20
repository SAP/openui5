sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/4x4-grid-layout", "./v2/4x4-grid-layout"], function (_exports, _Theme, _x4GridLayout, _x4GridLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _x4GridLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _x4GridLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _x4GridLayout.pathData : _x4GridLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/4x4-grid-layout";
  _exports.default = _default;
});