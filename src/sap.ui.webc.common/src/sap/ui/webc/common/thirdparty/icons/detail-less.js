sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/detail-less", "./v5/detail-less"], function (_exports, _Theme, _detailLess, _detailLess2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _detailLess.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _detailLess.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _detailLess.pathData : _detailLess2.pathData;
  _exports.pathData = pathData;
  var _default = "detail-less";
  _exports.default = _default;
});