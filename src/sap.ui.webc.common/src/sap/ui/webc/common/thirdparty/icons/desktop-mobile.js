sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/desktop-mobile", "./v5/desktop-mobile"], function (_exports, _Theme, _desktopMobile, _desktopMobile2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _desktopMobile.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _desktopMobile.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _desktopMobile.pathData : _desktopMobile2.pathData;
  _exports.pathData = pathData;
  var _default = "desktop-mobile";
  _exports.default = _default;
});