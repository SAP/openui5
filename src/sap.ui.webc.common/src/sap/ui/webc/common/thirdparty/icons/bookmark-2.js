sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bookmark-2", "./v5/bookmark-2"], function (_exports, _Theme, _bookmark, _bookmark2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bookmark.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bookmark.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bookmark.pathData : _bookmark2.pathData;
  _exports.pathData = pathData;
  var _default = "bookmark-2";
  _exports.default = _default;
});