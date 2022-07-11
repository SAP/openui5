sap.ui.define(["exports", "./theming/CustomStyle", "./theming/ThemeLoaded"], function (_exports, _CustomStyle, _ThemeLoaded) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "addCustomCSS", {
    enumerable: true,
    get: function () {
      return _CustomStyle.addCustomCSS;
    }
  });
  Object.defineProperty(_exports, "attachThemeLoaded", {
    enumerable: true,
    get: function () {
      return _ThemeLoaded.attachThemeLoaded;
    }
  });
  Object.defineProperty(_exports, "detachThemeLoaded", {
    enumerable: true,
    get: function () {
      return _ThemeLoaded.detachThemeLoaded;
    }
  });
});