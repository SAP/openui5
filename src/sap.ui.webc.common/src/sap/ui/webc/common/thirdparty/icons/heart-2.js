sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/heart-2", "./v5/heart-2"], function (_exports, _Theme, _heart, _heart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _heart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _heart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _heart.pathData : _heart2.pathData;
  _exports.pathData = pathData;
  var _default = "heart-2";
  _exports.default = _default;
});