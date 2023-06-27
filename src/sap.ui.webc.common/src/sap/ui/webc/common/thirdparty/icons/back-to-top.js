sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/back-to-top", "./v5/back-to-top"], function (_exports, _Theme, _backToTop, _backToTop2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _backToTop.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _backToTop.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _backToTop.pathData : _backToTop2.pathData;
  _exports.pathData = pathData;
  var _default = "back-to-top";
  _exports.default = _default;
});