sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/business-card", "./v5/business-card"], function (_exports, _Theme, _businessCard, _businessCard2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessCard.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessCard.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessCard.pathData : _businessCard2.pathData;
  _exports.pathData = pathData;
  var _default = "business-card";
  _exports.default = _default;
});