sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/home-share", "./v5/home-share"], function (_exports, _Theme, _homeShare, _homeShare2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _homeShare.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _homeShare.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _homeShare.pathData : _homeShare2.pathData;
  _exports.pathData = pathData;
  var _default = "home-share";
  _exports.default = _default;
});