sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/page-down", "./v2/page-down"], function (_exports, _Theme, _pageDown, _pageDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pageDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pageDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pageDown.pathData : _pageDown2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/page-down";
  _exports.default = _default;
});