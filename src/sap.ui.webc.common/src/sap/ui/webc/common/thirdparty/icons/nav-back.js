sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/nav-back", "./v5/nav-back"], function (_exports, _Theme, _navBack, _navBack2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _navBack.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _navBack.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _navBack.pathData : _navBack2.pathData;
  _exports.pathData = pathData;
  var _default = "nav-back";
  _exports.default = _default;
});