sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/navigation-left-arrow", "./v5/navigation-left-arrow"], function (_exports, _Theme, _navigationLeftArrow, _navigationLeftArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _navigationLeftArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _navigationLeftArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _navigationLeftArrow.pathData : _navigationLeftArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "navigation-left-arrow";
  _exports.default = _default;
});