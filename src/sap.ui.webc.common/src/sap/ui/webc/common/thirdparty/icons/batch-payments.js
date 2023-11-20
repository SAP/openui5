sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/batch-payments", "./v5/batch-payments"], function (_exports, _Theme, _batchPayments, _batchPayments2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _batchPayments.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _batchPayments.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _batchPayments.pathData : _batchPayments2.pathData;
  _exports.pathData = pathData;
  var _default = "batch-payments";
  _exports.default = _default;
});