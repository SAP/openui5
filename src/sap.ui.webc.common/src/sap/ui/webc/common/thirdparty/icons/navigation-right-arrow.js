sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/navigation-right-arrow", "./v5/navigation-right-arrow"], function (_exports, _Theme, _navigationRightArrow, _navigationRightArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _navigationRightArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _navigationRightArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _navigationRightArrow.pathData : _navigationRightArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "navigation-right-arrow";
  _exports.default = _default;
});