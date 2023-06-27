sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/auto-layout", "./v3/auto-layout"], function (_exports, _Theme, _autoLayout, _autoLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _autoLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _autoLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _autoLayout.pathData : _autoLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/auto-layout";
  _exports.default = _default;
});