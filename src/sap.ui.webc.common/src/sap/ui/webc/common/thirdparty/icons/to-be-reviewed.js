sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/to-be-reviewed", "./v5/to-be-reviewed"], function (_exports, _Theme, _toBeReviewed, _toBeReviewed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _toBeReviewed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _toBeReviewed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _toBeReviewed.pathData : _toBeReviewed2.pathData;
  _exports.pathData = pathData;
  var _default = "to-be-reviewed";
  _exports.default = _default;
});