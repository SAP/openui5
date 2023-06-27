sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/add-favorite", "./v5/add-favorite"], function (_exports, _Theme, _addFavorite, _addFavorite2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addFavorite.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addFavorite.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addFavorite.pathData : _addFavorite2.pathData;
  _exports.pathData = pathData;
  var _default = "add-favorite";
  _exports.default = _default;
});