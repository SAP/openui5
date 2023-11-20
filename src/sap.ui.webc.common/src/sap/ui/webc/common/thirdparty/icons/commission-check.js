sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/commission-check", "./v5/commission-check"], function (_exports, _Theme, _commissionCheck, _commissionCheck2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _commissionCheck.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _commissionCheck.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _commissionCheck.pathData : _commissionCheck2.pathData;
  _exports.pathData = pathData;
  var _default = "commission-check";
  _exports.default = _default;
});