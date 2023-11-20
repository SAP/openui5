sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/internet-browser", "./v5/internet-browser"], function (_exports, _Theme, _internetBrowser, _internetBrowser2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _internetBrowser.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _internetBrowser.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _internetBrowser.pathData : _internetBrowser2.pathData;
  _exports.pathData = pathData;
  var _default = "internet-browser";
  _exports.default = _default;
});