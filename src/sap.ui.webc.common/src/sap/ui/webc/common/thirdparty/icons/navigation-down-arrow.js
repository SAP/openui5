sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/navigation-down-arrow", "./v5/navigation-down-arrow"], function (_exports, _Theme, _navigationDownArrow, _navigationDownArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _navigationDownArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _navigationDownArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _navigationDownArrow.pathData : _navigationDownArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "navigation-down-arrow";
  _exports.default = _default;
});