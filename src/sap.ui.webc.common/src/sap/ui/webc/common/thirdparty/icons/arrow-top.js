sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/arrow-top", "./v5/arrow-top"], function (_exports, _Theme, _arrowTop, _arrowTop2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arrowTop.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arrowTop.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arrowTop.pathData : _arrowTop2.pathData;
  _exports.pathData = pathData;
  var _default = "arrow-top";
  _exports.default = _default;
});