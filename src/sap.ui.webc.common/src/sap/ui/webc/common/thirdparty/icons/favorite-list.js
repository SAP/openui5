sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/favorite-list", "./v5/favorite-list"], function (_exports, _Theme, _favoriteList, _favoriteList2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _favoriteList.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _favoriteList.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _favoriteList.pathData : _favoriteList2.pathData;
  _exports.pathData = pathData;
  var _default = "favorite-list";
  _exports.default = _default;
});