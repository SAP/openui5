sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/detail-more", "./v5/detail-more"], function (_exports, _Theme, _detailMore, _detailMore2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _detailMore.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _detailMore.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _detailMore.pathData : _detailMore2.pathData;
  _exports.pathData = pathData;
  var _default = "detail-more";
  _exports.default = _default;
});