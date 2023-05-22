sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/navigation-up-arrow", "./v5/navigation-up-arrow"], function (_exports, _Theme, _navigationUpArrow, _navigationUpArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _navigationUpArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _navigationUpArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _navigationUpArrow.pathData : _navigationUpArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "navigation-up-arrow";
  _exports.default = _default;
});